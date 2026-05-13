-- ============================================================
--  BarberFlow — Tabela de configurações de automação
--  Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists config_automacoes (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade unique,
  boas_vindas         text not null default '',
  confirmacao         text not null default '',
  lembrete            text not null default '',
  nps_request         text not null default '',
  whatsapp_url        text not null default 'https://api.evolution-api.com',
  whatsapp_instancia  text not null default '',
  whatsapp_token      text not null default '',
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

alter table config_automacoes enable row level security;

create policy "tenant ve propria automacao" on config_automacoes
  for select using (tenant_id = fn_tenant_id_atual());

create policy "tenant edita propria automacao" on config_automacoes
  for all using (tenant_id = fn_tenant_id_atual());
