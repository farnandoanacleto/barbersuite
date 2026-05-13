-- ============================================================
--  BarberFlow — Comandas, Estoque e Produtos
--  Execute no SQL Editor do Supabase
-- ============================================================

-- ─── PRODUTOS ─────────────────────────────────────────────
create table if not exists produtos (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  nome                text not null,
  categoria           text default 'outros',
  sku                 text,
  preco_custo         numeric(10,2) default 0,
  preco_venda         numeric(10,2) default 0,
  quantidade_estoque  numeric(10,3) default 0,
  ativo               boolean default true,
  criado_em           timestamptz default now(),
  atualizado_em       timestamptz default now(),
  unique (tenant_id, sku)
);

alter table produtos enable row level security;
create policy "tenant ve proprios produtos" on produtos
  for all using (tenant_id = fn_tenant_id_atual());

-- ─── ESTOQUE MOVIMENTAÇÕES ────────────────────────────────
create table if not exists estoque_movimentacoes (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  produto_id  uuid not null references produtos(id) on delete cascade,
  tipo        text not null check (tipo in ('entrada','saida')),
  quantidade  numeric(10,3) not null,
  motivo      text,
  criado_em   timestamptz default now()
);

alter table estoque_movimentacoes enable row level security;
create policy "tenant ve proprias movimentacoes" on estoque_movimentacoes
  for all using (tenant_id = fn_tenant_id_atual());

-- ─── COMANDAS ─────────────────────────────────────────────
create table if not exists comandas (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  cliente_id  uuid references usuarios(id),
  status      text not null default 'aberta' check (status in ('aberta','paga','cancelada')),
  subtotal    numeric(10,2) default 0,
  desconto    numeric(10,2) default 0,
  total       numeric(10,2) default 0,
  aberta_em   timestamptz default now(),
  fechada_em  timestamptz
);

alter table comandas enable row level security;
create policy "tenant ve proprias comandas" on comandas
  for all using (tenant_id = fn_tenant_id_atual());

-- ─── COMANDA ITENS ────────────────────────────────────────
create table if not exists comanda_itens (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  comanda_id      uuid not null references comandas(id) on delete cascade,
  produto_id      uuid references produtos(id),
  servico_id      uuid references servicos(id),
  nome_item       text not null,
  quantidade      numeric(10,3) not null default 1,
  preco_unitario  numeric(10,2) not null default 0,
  subtotal        numeric(10,2) not null default 0,
  criado_em       timestamptz default now()
);

alter table comanda_itens enable row level security;
create policy "tenant ve proprios itens" on comanda_itens
  for all using (tenant_id = fn_tenant_id_atual());
