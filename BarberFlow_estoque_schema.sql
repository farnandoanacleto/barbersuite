-- ============================================================
--  BarberFlow — Módulo: Estoque e Comandas
--  Execute no SQL Editor do Supabase
-- ============================================================

-- ─── Tabela de Produtos (Estoque) ────────────────────────────
create table if not exists produtos (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  nome                text not null,
  descricao           text,
  categoria           text,
  preco_custo         numeric(10,2) not null default 0,
  preco_venda         numeric(10,2) not null default 0,
  quantidade_estoque  integer not null default 0,
  sku                 text,
  ativo               boolean default true,
  criado_em           timestamptz default now()
);
create index idx_produtos_tenant on produtos(tenant_id);
alter table produtos enable row level security;
create policy "tenant isolado" on produtos using (tenant_id = fn_tenant_id_atual());

-- ─── Histórico de Movimentações de Estoque ───────────────────
create table if not exists estoque_movimentacoes (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  produto_id    uuid not null references produtos(id) on delete cascade,
  tipo          text not null check (tipo in ('entrada', 'saida', 'ajuste')),
  quantidade    integer not null,
  motivo        text,
  criado_em     timestamptz default now()
);
create index idx_movimentacoes_tenant on estoque_movimentacoes(tenant_id);
create index idx_movimentacoes_produto on estoque_movimentacoes(produto_id);
alter table estoque_movimentacoes enable row level security;
create policy "tenant isolado" on estoque_movimentacoes using (tenant_id = fn_tenant_id_atual());

-- ─── Comandas (Pedidos Abertos no Salão) ─────────────────────
create table if not exists comandas (
  id            uuid primary key default uuid_generate_v4(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  cliente_id    uuid not null references usuarios(id),
  status        text not null default 'aberta' check (status in ('aberta', 'paga', 'cancelada')),
  subtotal      numeric(10,2) not null default 0,
  desconto      numeric(10,2) not null default 0,
  total         numeric(10,2) not null default 0,
  observacao    text,
  aberta_em     timestamptz default now(),
  fechada_em    timestamptz
);
create index idx_comandas_tenant on comandas(tenant_id);
create index idx_comandas_cliente on comandas(cliente_id);
alter table comandas enable row level security;
create policy "tenant isolado" on comandas using (tenant_id = fn_tenant_id_atual());

-- ─── Itens da Comanda (Produtos e Serviços) ──────────────────
create table if not exists comanda_itens (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  comanda_id      uuid not null references comandas(id) on delete cascade,
  produto_id      uuid references produtos(id),
  servico_id      uuid references servicos(id),
  nome_item       text not null,
  quantidade      integer not null default 1,
  preco_unitario  numeric(10,2) not null,
  subtotal        numeric(10,2) not null,
  criado_em       timestamptz default now(),
  -- Validação: O item deve ser um produto ou um serviço, mas não ambos
  constraint chk_produto_ou_servico check (
    (produto_id is not null and servico_id is null) or
    (produto_id is null and servico_id is not null) or
    (produto_id is null and servico_id is null) -- Para itens avulsos
  )
);
create index idx_comanda_itens_tenant on comanda_itens(tenant_id);
create index idx_comanda_itens_comanda on comanda_itens(comanda_id);
alter table comanda_itens enable row level security;
create policy "tenant isolado" on comanda_itens using (tenant_id = fn_tenant_id_atual());

-- ─── Alterar Pagamentos ──────────────────────────────────────
alter table pagamentos add column if not exists comanda_id uuid references comandas(id);
