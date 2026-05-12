-- ============================================================
--  BarberFlow — Fase 2: Financeiro
--  Execute no SQL Editor do Supabase (após o schema principal)
-- ============================================================

-- ─── Despesas fixas e variáveis ──────────────────────────────
create table if not exists despesas (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  categoria     text not null check (categoria in (
                  'aluguel','produtos','energia','internet',
                  'sistema','marketing','manutencao','comissao','outros')),
  descricao     text not null,
  valor         numeric(10,2) not null,
  competencia   date not null,          -- mês de referência (primeiro dia)
  recorrente    boolean default false,  -- se é despesa fixa mensal
  criado_em     timestamptz default now()
);
create index idx_despesas_tenant      on despesas(tenant_id);
create index idx_despesas_competencia on despesas(competencia);
alter table despesas enable row level security;
create policy "tenant isolado" on despesas using (tenant_id = fn_tenant_id_atual());

-- ─── Comissões por barbeiro ───────────────────────────────────
create table if not exists comissoes (
  id                uuid primary key default uuid_generate_v4(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  profissional_id   uuid not null references profissionais(id),
  competencia       date not null,
  faturamento_base  numeric(10,2) not null default 0,
  percentual        numeric(5,2)  not null,
  valor_comissao    numeric(10,2) not null,
  status            text not null default 'pendente'
                      check (status in ('pendente','pago')),
  pago_em           timestamptz,
  observacao        text,
  criado_em         timestamptz default now()
);
create index idx_comissoes_tenant   on comissoes(tenant_id);
create index idx_comissoes_prof     on comissoes(profissional_id);
create index idx_comissoes_status   on comissoes(status);
alter table comissoes enable row level security;
create policy "tenant isolado" on comissoes using (tenant_id = fn_tenant_id_atual());

-- ─── Metas mensais ───────────────────────────────────────────
create table if not exists metas (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  competencia   date not null,
  meta_total    numeric(10,2) not null,
  meta_clube    numeric(10,2),
  meta_avulso   numeric(10,2),
  unique (tenant_id, competencia)
);
alter table metas enable row level security;
create policy "tenant isolado" on metas using (tenant_id = fn_tenant_id_atual());

-- ─── seed: meta de março ─────────────────────────────────────
insert into metas (tenant_id, competencia, meta_total, meta_clube, meta_avulso)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  '2026-03-01', 50000, 20000, 30000
) on conflict do nothing;

-- ============================================================
--  FUNÇÕES FINANCEIRAS
-- ============================================================

-- ─── DRE do mês ──────────────────────────────────────────────
create or replace function fn_dre_mes(p_tenant_id uuid, p_competencia date)
returns jsonb language plpgsql stable as $$
declare
  rec_avulsa  numeric := 0;
  rec_clube   numeric := 0;
  total_desp  numeric := 0;
  total_com   numeric := 0;
  result      jsonb;
begin
  -- receita avulsa (agendamentos pagos no mês)
  select coalesce(sum(pg.valor),0) into rec_avulsa
  from pagamentos pg
  join agendamentos ag on ag.id = pg.agendamento_id
  where pg.tenant_id = p_tenant_id
    and pg.status = 'pago'
    and date_trunc('month', pg.pago_em) = date_trunc('month', p_competencia);

  -- receita clube (assinaturas pagas no mês)
  select coalesce(sum(pg.valor),0) into rec_clube
  from pagamentos pg
  where pg.tenant_id = p_tenant_id
    and pg.status = 'pago'
    and pg.assinatura_id is not null
    and date_trunc('month', pg.pago_em) = date_trunc('month', p_competencia);

  -- total despesas
  select coalesce(sum(valor),0) into total_desp
  from despesas
  where tenant_id = p_tenant_id
    and competencia = date_trunc('month', p_competencia)::date
    and categoria != 'comissao';

  -- total comissões
  select coalesce(sum(valor_comissao),0) into total_com
  from comissoes
  where tenant_id = p_tenant_id
    and competencia = date_trunc('month', p_competencia)::date;

  result := jsonb_build_object(
    'competencia',   p_competencia,
    'rec_avulsa',    rec_avulsa,
    'rec_clube',     rec_clube,
    'rec_total',     rec_avulsa + rec_clube,
    'desp_total',    total_desp,
    'com_total',     total_com,
    'lucro_bruto',   (rec_avulsa + rec_clube) - total_desp,
    'lucro_liquido', (rec_avulsa + rec_clube) - total_desp - total_com,
    'margem_pct',    case when (rec_avulsa + rec_clube) > 0
                     then round(((rec_avulsa + rec_clube - total_desp - total_com)
                                / (rec_avulsa + rec_clube)) * 100, 1)
                     else 0 end
  );

  return result;
end;
$$;

-- ─── Gerar comissões do mês automaticamente ──────────────────
create or replace function fn_gerar_comissoes(p_tenant_id uuid, p_competencia date)
returns integer language plpgsql as $$
declare
  prof    record;
  fat     numeric;
  com_val numeric;
  geradas integer := 0;
begin
  for prof in
    select p.id, p.comissao_pct, u.nome
    from profissionais p
    join usuarios u on u.id = p.usuario_id
    where p.tenant_id = p_tenant_id and p.ativo = true
  loop
    -- faturamento do profissional no mês
    select coalesce(sum(s.preco), 0) into fat
    from agendamentos a
    join servicos s on s.id = a.servico_id
    where a.profissional_id = prof.id
      and a.tenant_id = p_tenant_id
      and a.status = 'concluido'
      and date_trunc('month', a.inicio) = date_trunc('month', p_competencia);

    if fat > 0 then
      com_val := round(fat * prof.comissao_pct / 100, 2);

      insert into comissoes (
        tenant_id, profissional_id, competencia,
        faturamento_base, percentual, valor_comissao, status
      ) values (
        p_tenant_id, prof.id,
        date_trunc('month', p_competencia)::date,
        fat, prof.comissao_pct, com_val, 'pendente'
      )
      on conflict do nothing;

      geradas := geradas + 1;
    end if;
  end loop;

  return geradas;
end;
$$;

-- ─── Inadimplência ativa ─────────────────────────────────────
create or replace function fn_inadimplentes(p_tenant_id uuid)
returns table (
  assinatura_id   uuid,
  cliente_nome    text,
  cliente_tel     text,
  plano_nome      text,
  valor_mensal    numeric,
  dias_atraso     integer,
  tentativas      integer
) language sql stable as $$
  select
    a.id,
    u.nome,
    u.telefone,
    pl.nome,
    pl.preco_mensal,
    coalesce(extract(day from now() - a.proximo_pagamento)::integer, 0),
    0  -- tentativas viriam de uma tabela de log de cobranças
  from assinaturas a
  join usuarios u      on u.id = a.cliente_id
  join planos_clube pl on pl.id = a.plano_id
  where a.tenant_id = p_tenant_id
    and a.status in ('inadimplente', 'ativa')
    and a.proximo_pagamento < current_date
  order by a.proximo_pagamento asc;
$$;

-- ─── Previsão de faturamento (próximos N meses) ───────────────
create or replace function fn_previsao_faturamento(
  p_tenant_id uuid,
  p_meses     integer default 3
)
returns table (
  mes           date,
  receita_clube numeric,
  receita_avulsa_est numeric,
  total_est     numeric
) language plpgsql stable as $$
declare
  media_avulsa  numeric;
  membros_ativos integer;
  ticket_clube  numeric;
begin
  -- média avulso últimos 3 meses
  select coalesce(avg(mensal),0) into media_avulsa
  from (
    select date_trunc('month', pg.pago_em) as mes,
           sum(pg.valor) as mensal
    from pagamentos pg
    where pg.tenant_id = p_tenant_id
      and pg.status = 'pago'
      and pg.agendamento_id is not null
      and pg.pago_em >= now() - interval '3 months'
    group by 1
  ) t;

  -- receita recorrente do clube (membros ativos × ticket médio)
  select count(*), coalesce(avg(pl.preco_mensal),0)
  into membros_ativos, ticket_clube
  from assinaturas a
  join planos_clube pl on pl.id = a.plano_id
  where a.tenant_id = p_tenant_id and a.status = 'ativa';

  return query
  select
    (date_trunc('month', now()) + (n || ' months')::interval)::date,
    (membros_ativos * ticket_clube)::numeric,
    (media_avulsa * (1 + n * 0.05))::numeric,  -- 5% crescimento estimado ao mês
    (membros_ativos * ticket_clube + media_avulsa * (1 + n * 0.05))::numeric
  from generate_series(1, p_meses) as n;
end;
$$;

-- ─── View: DRE histórico (últimos 6 meses) ───────────────────
create or replace view vw_historico_financeiro as
select
  date_trunc('month', pg.pago_em)::date            as mes,
  sum(pg.valor) filter (where pg.agendamento_id is not null) as avulso,
  sum(pg.valor) filter (where pg.assinatura_id  is not null) as clube,
  sum(pg.valor)                                              as total,
  pg.tenant_id
from pagamentos pg
where pg.status = 'pago'
  and pg.pago_em >= now() - interval '12 months'
group by date_trunc('month', pg.pago_em), pg.tenant_id
order by mes desc;
