-- ============================================================
--  BARBERFLOW — Schema completo Supabase
--  Execute no SQL Editor do Supabase na ordem abaixo
--  Versão 1.0 · MVP Fase 1
-- ============================================================

-- ─── EXTENSÕES ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_cron";       -- para jobs agendados (score de churn)

-- ============================================================
--  1. TENANTS  (multi-tenant / SaaS)
-- ============================================================
create table tenants (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  slug            text not null unique,          -- ex: "barberflow"
  plano_saas      text not null default 'starter' check (plano_saas in ('starter','pro','enterprise')),
  whatsapp_token  text,                          -- token Evolution API
  stripe_account  text,                          -- Stripe Connect (futuro SaaS)
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

-- ─── seed: barbearia principal ────────────────────────────────
insert into tenants (id, nome, slug, plano_saas)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'BarberFlow',
  'barberflow',
  'pro'
);

-- ============================================================
--  2. USUARIOS  (clientes + staff compartilham a tabela)
-- ============================================================
create table usuarios (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  auth_id         uuid unique,                   -- referência ao auth.users do Supabase
  nome            text not null,
  email           text,
  telefone        text,
  papel           text not null default 'cliente' check (papel in ('admin','barbeiro','cliente')),
  aniversario     date,
  foto_url        text,
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now()
);

create index idx_usuarios_tenant    on usuarios(tenant_id);
create index idx_usuarios_papel     on usuarios(papel);
create index idx_usuarios_telefone  on usuarios(telefone);

-- ============================================================
--  3. PROFISSIONAIS
-- ============================================================
create table profissionais (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  usuario_id      uuid not null references usuarios(id) on delete cascade,
  especialidade   text,                          -- ex: "Fade, Barba clássica"
  comissao_pct    numeric(5,2) not null default 40.00,
  meta_mensal     numeric(10,2) not null default 10000.00,
  cor_agenda      text default '#B8973A',        -- cor na grade de agenda
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);

create index idx_profissionais_tenant on profissionais(tenant_id);

-- ============================================================
--  4. SERVICOS
-- ============================================================
create table servicos (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  nome            text not null,
  descricao       text,
  duracao_min     integer not null default 45,
  preco           numeric(10,2) not null,
  categoria       text default 'corte' check (categoria in ('corte','barba','skincare','combo','outro')),
  ativo           boolean not null default true,
  criado_em       timestamptz not null default now()
);

create index idx_servicos_tenant on servicos(tenant_id);

-- ─── seed: serviços padrão ────────────────────────────────────
insert into servicos (tenant_id, nome, duracao_min, preco, categoria) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Corte clássico',        45,  60.00, 'corte'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Fade premium',          60,  80.00, 'corte'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Barba luxo',            30,  50.00, 'barba'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Corte + Barba',         75, 120.00, 'combo'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Skincare facial',       45,  90.00, 'skincare'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Combo Black',           90, 180.00, 'combo'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Sobrancelha',           20,  30.00, 'outro'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Hidratação capilar',    30,  60.00, 'outro');

-- ============================================================
--  5. AGENDAMENTOS
-- ============================================================
create table agendamentos (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  cliente_id          uuid not null references usuarios(id),
  profissional_id     uuid not null references profissionais(id),
  servico_id          uuid not null references servicos(id),
  inicio              timestamptz not null,
  fim                 timestamptz not null,
  status              text not null default 'pendente'
                        check (status in ('pendente','confirmado','em_andamento','concluido','cancelado','no_show')),
  observacoes         text,
  lembrete_1d_enviado boolean not null default false,
  lembrete_1h_enviado boolean not null default false,
  confirmado_cliente  boolean not null default false,
  origem              text default 'manual' check (origem in ('manual','online','whatsapp','encaixe')),
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now(),

  constraint agendamento_periodo_valido check (fim > inicio)
);

create index idx_agendamentos_tenant          on agendamentos(tenant_id);
create index idx_agendamentos_cliente         on agendamentos(cliente_id);
create index idx_agendamentos_profissional    on agendamentos(profissional_id);
create index idx_agendamentos_inicio          on agendamentos(inicio);
create index idx_agendamentos_status          on agendamentos(status);

-- ─── view: agenda do dia ─────────────────────────────────────
create or replace view vw_agenda_hoje as
select
  a.id,
  a.tenant_id,
  a.inicio,
  a.fim,
  a.status,
  u_cli.nome       as cliente_nome,
  u_cli.telefone   as cliente_telefone,
  u_pro.nome       as profissional_nome,
  p.id             as profissional_id,
  s.nome           as servico_nome,
  s.duracao_min,
  s.preco,
  a.lembrete_1h_enviado,
  a.confirmado_cliente
from agendamentos a
join usuarios u_cli       on u_cli.id = a.cliente_id
join profissionais p      on p.id = a.profissional_id
join usuarios u_pro       on u_pro.id = p.usuario_id
join servicos s           on s.id = a.servico_id
where date(a.inicio at time zone 'America/Sao_Paulo') = current_date;

-- ============================================================
--  6. PLANOS DO CLUBE
-- ============================================================
create table planos_clube (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  nome                text not null,
  descricao           text,
  preco_mensal        numeric(10,2) not null,
  visitas_mes         integer,                   -- null = ilimitado
  servicos_incluidos  text[],                    -- ex: ARRAY['corte','barba']
  desconto_extras_pct numeric(5,2) default 0,
  stripe_price_id     text,                      -- ID do price no Stripe
  ativo               boolean not null default true,
  destaque            boolean not null default false,
  criado_em           timestamptz not null default now()
);

create index idx_planos_tenant on planos_clube(tenant_id);

-- ─── seed: planos BarberFlow ─────────────────────────────
insert into planos_clube (tenant_id, nome, preco_mensal, visitas_mes, servicos_incluidos, desconto_extras_pct) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Corte',      89.00,  4, ARRAY['corte'],         0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Barba',      69.00,  null, ARRAY['barba'],      0),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Combo',     139.00,  4, ARRAY['corte','barba'], 10),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Clube Black',249.00, null, ARRAY['corte','barba','skincare','combo'], 15);

update planos_clube set destaque = true
where nome = 'Clube Black' and tenant_id = 'a1b2c3d4-0000-0000-0000-000000000001';

-- ============================================================
--  7. ASSINATURAS
-- ============================================================
create table assinaturas (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  cliente_id          uuid not null references usuarios(id),
  plano_id            uuid not null references planos_clube(id),
  stripe_subscription_id text unique,
  stripe_customer_id  text,
  status              text not null default 'ativa'
                        check (status in ('ativa','pausada','cancelada','inadimplente','trial')),
  inicio              date not null default current_date,
  proximo_pagamento   date,
  cancelado_em        date,
  motivo_cancelamento text,
  uso_mes_atual       integer not null default 0,
  score_churn         integer not null default 0 check (score_churn between 0 and 100),
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

create index idx_assinaturas_tenant   on assinaturas(tenant_id);
create index idx_assinaturas_cliente  on assinaturas(cliente_id);
create index idx_assinaturas_status   on assinaturas(status);
create index idx_assinaturas_churn    on assinaturas(score_churn desc);

-- ============================================================
--  8. CRM — PREFERÊNCIAS DO CLIENTE
-- ============================================================
create table crm_preferencias (
  id                      uuid primary key default uuid_generate_v4(),
  tenant_id               uuid not null references tenants(id) on delete cascade,
  cliente_id              uuid not null references usuarios(id) on delete cascade unique,
  profissional_preferido  uuid references profissionais(id),
  tipo_corte              text[],                -- ex: ARRAY['Fade médio','Lateral fechada']
  tipo_barba              text[],
  extras_aceitos          text[],
  alergias                text,
  observacoes             text,
  nps_ultimo              numeric(3,1),
  atualizado_em           timestamptz not null default now()
);

create index idx_crm_tenant   on crm_preferencias(tenant_id);
create index idx_crm_cliente  on crm_preferencias(cliente_id);

-- ============================================================
--  9. PAGAMENTOS
-- ============================================================
create table pagamentos (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  agendamento_id      uuid references agendamentos(id),
  assinatura_id       uuid references assinaturas(id),
  valor               numeric(10,2) not null,
  metodo              text not null default 'dinheiro'
                        check (metodo in ('dinheiro','pix','credito','debito','stripe')),
  status              text not null default 'pendente'
                        check (status in ('pendente','pago','estornado','falhou')),
  stripe_payment_id   text,
  descricao           text,
  pago_em             timestamptz,
  criado_em           timestamptz not null default now(),

  constraint pagamento_tem_origem check (agendamento_id is not null or assinatura_id is not null)
);

create index idx_pagamentos_tenant        on pagamentos(tenant_id);
create index idx_pagamentos_agendamento   on pagamentos(agendamento_id);
create index idx_pagamentos_assinatura    on pagamentos(assinatura_id);
create index idx_pagamentos_pago_em       on pagamentos(pago_em);

-- ============================================================
--  10. LISTA DE ESPERA
-- ============================================================
create table lista_espera (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  cliente_id          uuid not null references usuarios(id),
  profissional_id     uuid references profissionais(id),   -- null = qualquer
  servico_id          uuid not null references servicos(id),
  data_preferida      date,
  hora_preferida_ini  time,
  hora_preferida_fim  time,
  solicitado_em       timestamptz not null default now(),
  notificado          boolean not null default false,
  notificado_em       timestamptz,
  expirado            boolean not null default false
);

create index idx_espera_tenant  on lista_espera(tenant_id);
create index idx_espera_cliente on lista_espera(cliente_id);

-- ============================================================
--  11. NO-SHOW TRACKING
-- ============================================================
create table no_shows (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  agendamento_id  uuid not null references agendamentos(id),
  cliente_id      uuid not null references usuarios(id),
  registrado_em   timestamptz not null default now(),
  bloqueado       boolean not null default false   -- bloquear após N no-shows
);

create index idx_noshows_cliente on no_shows(cliente_id);

-- ============================================================
--  FUNÇÕES E AUTOMAÇÕES
-- ============================================================

-- ─── Atualiza atualizado_em automaticamente ───────────────────
create or replace function fn_set_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_tenants_atualizado_em
  before update on tenants
  for each row execute function fn_set_atualizado_em();

create trigger trg_usuarios_atualizado_em
  before update on usuarios
  for each row execute function fn_set_atualizado_em();

create trigger trg_agendamentos_atualizado_em
  before update on agendamentos
  for each row execute function fn_set_atualizado_em();

create trigger trg_assinaturas_atualizado_em
  before update on assinaturas
  for each row execute function fn_set_atualizado_em();

-- ─── Score de churn (0–100) ───────────────────────────────────
-- Rodado diariamente via pg_cron ou função agendada no Next.js
create or replace function fn_calcular_churn(p_tenant_id uuid)
returns void language plpgsql as $$
declare
  rec record;
  dias_sem_visita integer;
  uso_percentual  numeric;
  score           integer;
begin
  for rec in
    select
      a.id as assinatura_id,
      a.cliente_id,
      a.uso_mes_atual,
      pl.visitas_mes,
      max(ag.inicio) as ultima_visita
    from assinaturas a
    join planos_clube pl on pl.id = a.plano_id
    left join agendamentos ag on ag.cliente_id = a.cliente_id
      and ag.status = 'concluido'
      and ag.tenant_id = p_tenant_id
    where a.tenant_id = p_tenant_id
      and a.status = 'ativa'
    group by a.id, a.cliente_id, a.uso_mes_atual, pl.visitas_mes
  loop
    -- dias sem visita (0 a 60+)
    dias_sem_visita := coalesce(
      extract(day from now() - rec.ultima_visita)::integer,
      60
    );

    -- uso do plano (quanto mais baixo, maior o risco)
    if rec.visitas_mes is not null and rec.visitas_mes > 0 then
      uso_percentual := (rec.uso_mes_atual::numeric / rec.visitas_mes) * 100;
    else
      uso_percentual := least(rec.uso_mes_atual * 12, 100);
    end if;

    -- score: peso 60% dias, 40% uso
    score := least(100, round(
      (least(dias_sem_visita, 60) / 60.0 * 60) +
      (greatest(0, 100 - uso_percentual) / 100.0 * 40)
    ));

    update assinaturas
    set score_churn = score
    where id = rec.assinatura_id;
  end loop;
end;
$$;

-- ─── Dashboard: faturamento por profissional (mês atual) ──────
create or replace function fn_dashboard_profissionais(p_tenant_id uuid)
returns table (
  profissional_id   uuid,
  nome              text,
  faturamento       numeric,
  atendimentos      integer,
  ticket_medio      numeric,
  meta_mensal       numeric,
  clubes_vendidos   integer
) language sql stable as $$
  select
    p.id                                         as profissional_id,
    u.nome,
    coalesce(sum(pg.valor) filter (where pg.status = 'pago'), 0) as faturamento,
    count(distinct a.id) filter (where a.status = 'concluido')::integer as atendimentos,
    coalesce(avg(s.preco) filter (where a.status = 'concluido'), 0) as ticket_medio,
    p.meta_mensal,
    count(distinct as2.id) filter (
      where date_trunc('month', as2.criado_em) = date_trunc('month', now())
    )::integer as clubes_vendidos
  from profissionais p
  join usuarios u          on u.id = p.usuario_id
  left join agendamentos a on a.profissional_id = p.id
    and date_trunc('month', a.inicio) = date_trunc('month', now())
    and a.tenant_id = p_tenant_id
  left join servicos s     on s.id = a.servico_id
  left join pagamentos pg  on pg.agendamento_id = a.id
  left join assinaturas as2 on as2.cliente_id = a.cliente_id
    and as2.tenant_id = p_tenant_id
  where p.tenant_id = p_tenant_id and p.ativo = true
  group by p.id, u.nome, p.meta_mensal;
$$;

-- ─── Verificar conflito de horário ────────────────────────────
create or replace function fn_tem_conflito(
  p_profissional_id uuid,
  p_inicio timestamptz,
  p_fim timestamptz,
  p_excluir_id uuid default null
) returns boolean language sql stable as $$
  select exists (
    select 1 from agendamentos
    where profissional_id = p_profissional_id
      and status not in ('cancelado', 'no_show')
      and id is distinct from p_excluir_id
      and tstzrange(inicio, fim) && tstzrange(p_inicio, p_fim)
  );
$$;

-- ─── Estatísticas do cliente (para o CRM) ────────────────────
create or replace function fn_stats_cliente(p_cliente_id uuid, p_tenant_id uuid)
returns table (
  total_visitas     bigint,
  ticket_medio      numeric,
  ultima_visita     timestamptz,
  dias_sem_visita   integer,
  servico_favorito  text,
  total_gasto       numeric
) language sql stable as $$
  select
    count(*)                                    as total_visitas,
    coalesce(avg(s.preco), 0)                   as ticket_medio,
    max(a.inicio)                               as ultima_visita,
    coalesce(extract(day from now() - max(a.inicio))::integer, 999) as dias_sem_visita,
    mode() within group (order by s.nome)       as servico_favorito,
    coalesce(sum(pg.valor) filter (where pg.status = 'pago'), 0)    as total_gasto
  from agendamentos a
  join servicos s     on s.id = a.servico_id
  left join pagamentos pg on pg.agendamento_id = a.id
  where a.cliente_id = p_cliente_id
    and a.tenant_id = p_tenant_id
    and a.status = 'concluido';
$$;

-- ============================================================
--  ROW LEVEL SECURITY (multi-tenant)
-- ============================================================

alter table tenants          enable row level security;
alter table usuarios         enable row level security;
alter table profissionais    enable row level security;
alter table servicos         enable row level security;
alter table agendamentos     enable row level security;
alter table planos_clube     enable row level security;
alter table assinaturas      enable row level security;
alter table crm_preferencias enable row level security;
alter table pagamentos       enable row level security;
alter table lista_espera     enable row level security;
alter table no_shows         enable row level security;

-- ─── Helper: retorna tenant_id do usuário logado ──────────────
create or replace function fn_tenant_id_atual()
returns uuid language sql stable as $$
  select tenant_id from usuarios where auth_id = auth.uid() limit 1;
$$;

-- ─── Policies: cada usuário só vê dados do seu tenant ─────────
create policy "tenant isolado" on usuarios
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on profissionais
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on servicos
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on agendamentos
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on planos_clube
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on assinaturas
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on crm_preferencias
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on pagamentos
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on lista_espera
  using (tenant_id = fn_tenant_id_atual());

create policy "tenant isolado" on no_shows
  using (tenant_id = fn_tenant_id_atual());

-- ─── Clientes só veem os próprios dados ──────────────────────
create policy "cliente ve proprio perfil" on usuarios
  using (
    auth.uid() = auth_id
    or exists (
      select 1 from usuarios u
      where u.auth_id = auth.uid()
        and u.papel in ('admin','barbeiro')
        and u.tenant_id = usuarios.tenant_id
    )
  );

-- ============================================================
--  QUERIES PRONTAS PARA O NEXT.JS
-- ============================================================

-- ─── Q1: Agenda do dia por barbeiro ──────────────────────────
/*
select * from vw_agenda_hoje
where tenant_id = $1
order by inicio, profissional_nome;
*/

-- ─── Q2: Lista de espera ativa ───────────────────────────────
/*
select
  le.*,
  u.nome as cliente_nome,
  u.telefone,
  s.nome as servico_nome,
  s.duracao_min,
  u2.nome as profissional_nome
from lista_espera le
join usuarios u   on u.id = le.cliente_id
join servicos s   on s.id = le.servico_id
left join profissionais p  on p.id = le.profissional_id
left join usuarios u2 on u2.id = p.usuario_id
where le.tenant_id = $1
  and le.notificado = false
  and le.expirado = false
order by le.solicitado_em;
*/

-- ─── Q3: Dashboard de membros com score de churn ─────────────
/*
select
  u.nome,
  pl.nome as plano,
  a.uso_mes_atual,
  pl.visitas_mes,
  a.score_churn,
  a.status,
  a.proximo_pagamento,
  a.criado_em as membro_desde
from assinaturas a
join usuarios u      on u.id = a.cliente_id
join planos_clube pl on pl.id = a.plano_id
where a.tenant_id = $1
order by a.score_churn desc, u.nome;
*/

-- ─── Q4: Clientes candidatos a upgrade ────────────────────────
/*
select
  u.nome,
  u.telefone,
  a.uso_mes_atual,
  pl.visitas_mes,
  pl.nome as plano_atual
from assinaturas a
join usuarios u      on u.id = a.cliente_id
join planos_clube pl on pl.id = a.plano_id
where a.tenant_id = $1
  and a.status = 'ativa'
  and pl.visitas_mes is not null
  and a.uso_mes_atual >= pl.visitas_mes   -- chegou no limite
order by a.uso_mes_atual desc;
*/

-- ─── Q5: Faturamento do mês (DRE simplificado) ───────────────
/*
select
  date_trunc('day', pg.pago_em at time zone 'America/Sao_Paulo') as dia,
  count(*)                              as transacoes,
  sum(pg.valor) filter (where ag.id is not null) as receita_avulsa,
  sum(pg.valor) filter (where as2.id is not null) as receita_clube,
  sum(pg.valor)                         as total_dia
from pagamentos pg
left join agendamentos ag on ag.id = pg.agendamento_id
left join assinaturas as2 on as2.id = pg.assinatura_id
where pg.tenant_id = $1
  and pg.status = 'pago'
  and date_trunc('month', pg.pago_em) = date_trunc('month', now())
group by 1
order by 1;
*/

-- ─── Q6: Slots disponíveis (encaixe) ─────────────────────────
/*
-- Retorna horários livres para um barbeiro em uma data
with slots as (
  select generate_series(
    ($2::date + '08:00'::time)::timestamptz,
    ($2::date + '19:00'::time)::timestamptz,
    ($3 || ' minutes')::interval          -- $3 = duração do serviço
  ) as slot_inicio
),
ocupados as (
  select inicio, fim from agendamentos
  where profissional_id = $1
    and date(inicio) = $2::date
    and status not in ('cancelado','no_show')
)
select s.slot_inicio
from slots s
where not exists (
  select 1 from ocupados o
  where tstzrange(s.slot_inicio, s.slot_inicio + ($3 || ' minutes')::interval)
    && tstzrange(o.inicio, o.fim)
)
order by slot_inicio;
*/

-- ============================================================
--  JOB AGENDADO: score de churn (diário às 02h)
-- ============================================================
/*
  -- Execute no SQL Editor do Supabase APÓS ativar pg_cron
  select cron.schedule(
    'calcular-churn-diario',
    '0 2 * * *',
    $$select fn_calcular_churn('a1b2c3d4-0000-0000-0000-000000000001')$$
  );
*/

-- ============================================================
--  FIM DO SCHEMA
-- ============================================================
