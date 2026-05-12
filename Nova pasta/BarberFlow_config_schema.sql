-- ============================================================
--  BarberFlow — Autenticação e configuração por barbearia
--  Execute no SQL Editor do Supabase
-- ============================================================

-- ─── 1. Habilitar Auth do Supabase ───────────────────────────
-- Já está habilitado por padrão. Vá em:
-- Authentication → Providers → Email → Enable

-- ─── 2. Tabela de perfis de barbearia ────────────────────────
create table if not exists barbearia_perfis (
  id                  uuid primary key default uuid_generate_v4(),
  tenant_id           uuid not null references tenants(id) on delete cascade unique,
  auth_user_id        uuid references auth.users(id),   -- dono/admin principal
  nome                text not null,
  slug                text not null unique,
  telefone            text,
  email               text,
  endereco            text,
  descricao           text,
  cor_principal       text default '#B8973A',
  logo_url            text,
  horario_abertura    time default '08:00',
  horario_fechamento  time default '19:00',
  dias_funcionamento  text[] default ARRAY['seg','ter','qua','qui','sex','sab'],
  ativo               boolean default true,
  plano_saas          text default 'starter' check (plano_saas in ('starter','pro','enterprise')),
  criado_em           timestamptz default now(),
  atualizado_em       timestamptz default now()
);

alter table barbearia_perfis enable row level security;

create policy "dono ve proprio perfil" on barbearia_perfis
  using (auth_user_id = auth.uid());

create policy "dono edita proprio perfil" on barbearia_perfis
  for all using (auth_user_id = auth.uid());

-- ─── 3. Membros da equipe com acesso ao sistema ───────────────
create table if not exists equipe_acessos (
  id          uuid primary key default uuid_generate_v4(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  auth_user_id uuid references auth.users(id),
  usuario_id  uuid references usuarios(id),
  papel       text not null default 'barbeiro' check (papel in ('admin','barbeiro','recepcionista')),
  ativo       boolean default true,
  convidado_em timestamptz default now(),
  aceito_em   timestamptz
);

alter table equipe_acessos enable row level security;

create policy "equipe ve proprio tenant" on equipe_acessos
  using (tenant_id = fn_tenant_id_atual());

-- ─── 4. Função: retorna tenant_id do usuário logado ──────────
-- (atualizada para suportar tanto usuario direto quanto equipe)
create or replace function fn_tenant_id_atual()
returns uuid language sql stable security definer set search_path = public as $$
  select coalesce(
    -- verifica na tabela de perfis (admin/dono)
    (select tenant_id from barbearia_perfis where auth_user_id = auth.uid() limit 1),
    -- verifica na tabela de acessos (equipe)
    (select tenant_id from equipe_acessos where auth_user_id = auth.uid() and ativo = true limit 1),
    -- fallback: usuario direto
    (select tenant_id from usuarios where auth_id = auth.uid() limit 1)
  );
$$;

-- ─── 5. Função: cadastrar nova barbearia ─────────────────────
create or replace function fn_cadastrar_barbearia(
  p_nome      text,
  p_email     text,
  p_slug      text,
  p_auth_id   uuid
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  novo_tenant_id uuid;
  novo_perfil_id uuid;
begin
  -- cria o tenant
  insert into tenants (nome, slug, plano_saas)
  values (p_nome, p_slug, 'starter')
  returning id into novo_tenant_id;

  -- cria o perfil da barbearia
  insert into barbearia_perfis (tenant_id, auth_user_id, nome, slug, email)
  values (novo_tenant_id, p_auth_id, p_nome, p_slug, p_email)
  returning id into novo_perfil_id;

  -- cria o usuário admin
  insert into usuarios (tenant_id, auth_id, nome, email, papel)
  values (novo_tenant_id, p_auth_id, p_nome, p_email, 'admin');

  -- seed: serviços padrão
  insert into servicos (tenant_id, nome, duracao_min, preco, categoria) values
    (novo_tenant_id, 'Corte clássico', 45,  60.00, 'corte'),
    (novo_tenant_id, 'Barba luxo',     30,  50.00, 'barba'),
    (novo_tenant_id, 'Corte + Barba',  75, 120.00, 'combo');

  -- seed: plano padrão
  insert into planos_clube (tenant_id, nome, preco_mensal, visitas_mes, servicos_incluidos)
  values (novo_tenant_id, 'Plano Básico', 89.00, 4, ARRAY['corte']);

  return jsonb_build_object(
    'tenant_id', novo_tenant_id,
    'perfil_id', novo_perfil_id,
    'slug',      p_slug
  );
end;
$$;

grant execute on function fn_cadastrar_barbearia(text,text,text,uuid) to anon, authenticated;

-- ─── 6. Função: buscar configuração completa da barbearia ─────
create or replace function fn_config_barbearia(p_tenant_id uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'perfil',   (select row_to_json(bp) from barbearia_perfis bp where bp.tenant_id = p_tenant_id),
    'servicos', (select json_agg(s order by s.categoria, s.nome)
                 from servicos s where s.tenant_id = p_tenant_id and s.ativo = true),
    'planos',   (select json_agg(p order by p.preco_mensal)
                 from planos_clube p where p.tenant_id = p_tenant_id and p.ativo = true),
    'equipe',   (select json_agg(u order by u.nome)
                 from usuarios u where u.tenant_id = p_tenant_id and u.papel = 'barbeiro' and u.ativo = true)
  );
$$;

grant execute on function fn_config_barbearia(uuid) to anon, authenticated;

-- ─── 7. Verificar configuração via SQL ───────────────────────
-- Após executar, teste com:
-- select fn_config_barbearia('a1b2c3d4-0000-0000-0000-000000000001');
