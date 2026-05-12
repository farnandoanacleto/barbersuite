-- ============================================================
--  BarberFlow — Fase 3: App do Cliente
--  Execute no SQL Editor do Supabase (após schemas anteriores)
-- ============================================================

-- ─── NPS / Avaliações ────────────────────────────────────────
create table if not exists avaliacoes (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  cliente_id      uuid not null references usuarios(id),
  agendamento_id  uuid references agendamentos(id),
  nota            integer not null check (nota between 0 and 10),
  aspectos        text[],
  comentario      text,
  respondido_em   timestamptz not null default now()
);
create index idx_avaliacoes_tenant  on avaliacoes(tenant_id);
create index idx_avaliacoes_cliente on avaliacoes(cliente_id);
create index idx_avaliacoes_nota    on avaliacoes(nota);
alter table avaliacoes enable row level security;
create policy "tenant isolado" on avaliacoes
  using (tenant_id = fn_tenant_id_atual());

-- ─── Programa de indicação ───────────────────────────────────
create table if not exists indicacoes (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  indicador_id        uuid not null references usuarios(id),
  indicado_id         uuid references usuarios(id),
  codigo              text not null,
  status              text not null default 'pendente'
                        check (status in ('pendente','convertido','expirado')),
  premio_valor        numeric(10,2) not null default 30.00,
  premio_aplicado     boolean not null default false,
  convertido_em       timestamptz,
  criado_em           timestamptz not null default now()
);
create index idx_indicacoes_tenant   on indicacoes(tenant_id);
create index idx_indicacoes_codigo   on indicacoes(codigo);
create index idx_indicacoes_indicador on indicacoes(indicador_id);
alter table indicacoes enable row level security;
create policy "tenant isolado" on indicacoes
  using (tenant_id = fn_tenant_id_atual());

-- ─── Gift Cards ──────────────────────────────────────────────
create table if not exists gift_cards (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  comprador_id    uuid not null references usuarios(id),
  destinatario_nome text,
  destinatario_tel  text,
  mensagem        text,
  valor           numeric(10,2) not null,
  codigo          text not null unique,
  status          text not null default 'ativo'
                    check (status in ('ativo','usado','expirado','cancelado')),
  usado_por       uuid references usuarios(id),
  usado_em        timestamptz,
  expira_em       date,
  stripe_payment_id text,
  criado_em       timestamptz not null default now()
);
create index idx_gift_cards_tenant  on gift_cards(tenant_id);
create index idx_gift_cards_codigo  on gift_cards(codigo);
create index idx_gift_cards_status  on gift_cards(status);
alter table gift_cards enable row level security;
create policy "tenant isolado" on gift_cards
  using (tenant_id = fn_tenant_id_atual());

-- ─── Notificações do cliente ─────────────────────────────────
create table if not exists notificacoes_cliente (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  cliente_id  uuid not null references usuarios(id),
  tipo        text not null check (tipo in (
                'lembrete_agendamento','nps_solicitacao','premio_indicacao',
                'gift_card_recebido','clube_renovacao','oferta_especial')),
  titulo      text not null,
  mensagem    text not null,
  lida        boolean not null default false,
  criado_em   timestamptz not null default now()
);
create index idx_notif_cliente on notificacoes_cliente(cliente_id);
alter table notificacoes_cliente enable row level security;
create policy "tenant isolado" on notificacoes_cliente
  using (tenant_id = fn_tenant_id_atual());

-- ============================================================
--  FUNÇÕES FASE 3
-- ============================================================

-- ─── Gerar código único de indicação ─────────────────────────
create or replace function fn_codigo_indicacao(p_nome text)
returns text language sql as $$
  select upper(
    substring(regexp_replace(p_nome, '[^a-zA-Z]', '', 'g'), 1, 4) ||
    to_char(extract(year from now()), 'YYYY')
  );
$$;

-- ─── Registrar avaliação NPS ──────────────────────────────────
create or replace function fn_registrar_nps(
  p_tenant_id     uuid,
  p_cliente_id    uuid,
  p_agendamento_id uuid,
  p_nota          integer,
  p_aspectos      text[],
  p_comentario    text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  avaliacao_id uuid;
begin
  insert into avaliacoes (tenant_id, cliente_id, agendamento_id, nota, aspectos, comentario)
  values (p_tenant_id, p_cliente_id, p_agendamento_id, p_nota, p_aspectos, p_comentario)
  returning id into avaliacao_id;

  -- atualiza NPS no CRM
  update crm_preferencias set nps_ultimo = p_nota, atualizado_em = now()
  where cliente_id = p_cliente_id;

  -- se nota >= 9, cria notificação sugerindo indicação
  if p_nota >= 9 then
    insert into notificacoes_cliente (tenant_id, cliente_id, tipo, titulo, mensagem)
    values (p_tenant_id, p_cliente_id, 'prize_indicacao',
            'Indique e ganhe R$30!',
            'Você adorou? Compartilhe seu código e ganhe desconto na próxima visita.');
  end if;

  return avaliacao_id;
end;
$$;

grant execute on function fn_registrar_nps(uuid,uuid,uuid,integer,text[],text) to anon, authenticated;

-- ─── NPS médio do tenant (dashboard) ─────────────────────────
create or replace function fn_nps_medio(p_tenant_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'media',      round(avg(nota)::numeric, 1),
    'promotores', count(*) filter (where nota >= 9),
    'neutros',    count(*) filter (where nota between 7 and 8),
    'detratores', count(*) filter (where nota <= 6),
    'total',      count(*),
    'nps_score',  round((
      (count(*) filter (where nota >= 9)::numeric -
       count(*) filter (where nota <= 6)::numeric)
      / nullif(count(*), 0) * 100
    ), 0)
  )
  from avaliacoes
  where tenant_id = p_tenant_id
    and respondido_em >= now() - interval '90 days';
$$;

grant execute on function fn_nps_medio(uuid) to anon, authenticated;

-- ─── Gerar gift card ─────────────────────────────────────────
create or replace function fn_criar_gift_card(
  p_tenant_id       uuid,
  p_comprador_id    uuid,
  p_valor           numeric,
  p_destinatario_nome text,
  p_destinatario_tel  text,
  p_mensagem        text
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  novo_codigo text;
  gift_id     uuid;
begin
  -- gera código único
  loop
    novo_codigo := 'GIFT-' ||
      upper(substr(md5(random()::text), 1, 4)) || '-' ||
      upper(substr(md5(random()::text), 1, 4));
    exit when not exists (select 1 from gift_cards where codigo = novo_codigo);
  end loop;

  insert into gift_cards (
    tenant_id, comprador_id, destinatario_nome, destinatario_tel,
    mensagem, valor, codigo, expira_em
  ) values (
    p_tenant_id, p_comprador_id, p_destinatario_nome, p_destinatario_tel,
    p_mensagem, p_valor, novo_codigo,
    (current_date + interval '1 year')::date
  ) returning id into gift_id;

  return jsonb_build_object('id', gift_id, 'codigo', novo_codigo, 'valor', p_valor);
end;
$$;

grant execute on function fn_criar_gift_card(uuid,uuid,numeric,text,text,text) to anon, authenticated;

-- ─── Aplicar gift card em agendamento ────────────────────────
create or replace function fn_aplicar_gift_card(
  p_codigo     text,
  p_cliente_id uuid,
  p_tenant_id  uuid
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  gc gift_cards%rowtype;
begin
  select * into gc from gift_cards
  where codigo = p_codigo and tenant_id = p_tenant_id and status = 'ativo'
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'erro', 'Gift card inválido ou já utilizado');
  end if;

  if gc.expira_em < current_date then
    update gift_cards set status = 'expirado' where id = gc.id;
    return jsonb_build_object('ok', false, 'erro', 'Gift card expirado');
  end if;

  update gift_cards set
    status = 'usado', usado_por = p_cliente_id, usado_em = now()
  where id = gc.id;

  return jsonb_build_object('ok', true, 'valor', gc.valor, 'codigo', gc.codigo);
end;
$$;

grant execute on function fn_aplicar_gift_card(text,uuid,uuid) to anon, authenticated;

-- ─── Processar indicação convertida ──────────────────────────
create or replace function fn_converter_indicacao(
  p_codigo     text,
  p_indicado_id uuid,
  p_tenant_id  uuid
) returns boolean language plpgsql security definer set search_path = public as $$
declare
  ind indicacoes%rowtype;
begin
  select * into ind from indicacoes
  where codigo = p_codigo and tenant_id = p_tenant_id and status = 'pendente'
  for update;

  if not found then return false; end if;

  update indicacoes set
    status = 'convertido', indicado_id = p_indicado_id, convertido_em = now()
  where id = ind.id;

  -- notifica o indicador sobre o prêmio
  insert into notificacoes_cliente (tenant_id, cliente_id, tipo, titulo, mensagem)
  values (p_tenant_id, ind.indicador_id, 'premio_indicacao',
    'Seu amigo entrou! +R$30 de desconto',
    'Sua indicação foi convertida. Seu desconto de R$30 está disponível.');

  return true;
end;
$$;

grant execute on function fn_converter_indicacao(text,uuid,uuid) to anon, authenticated;

-- ─── View: NPS por período (para dashboard) ──────────────────
create or replace view vw_avaliacoes_resumo as
select
  tenant_id,
  date_trunc('month', respondido_em)::date as mes,
  round(avg(nota)::numeric, 1)             as media,
  count(*)                                 as total,
  count(*) filter (where nota >= 9)        as promotores,
  count(*) filter (where nota <= 6)        as detratores
from avaliacoes
group by tenant_id, date_trunc('month', respondido_em);
