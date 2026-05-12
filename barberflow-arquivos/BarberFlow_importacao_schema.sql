-- ============================================================
--  BarberFlow — Suporte à importação de clientes
--  Execute no SQL Editor do Supabase
-- ============================================================

-- ─── Tabela de controle de importações ───────────────────────
create table if not exists importacoes (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  arquivo_nome    text not null,
  formato         text not null,           -- XML, CSV, JSON
  total_arquivo   integer not null default 0,
  importados      integer not null default 0,
  atualizados     integer not null default 0,
  ignorados       integer not null default 0,
  erros           integer not null default 0,
  status          text not null default 'pendente'
                    check (status in ('pendente','em_andamento','concluido','falhou')),
  erros_detalhe   jsonb,                   -- lista de erros com linha e motivo
  criado_por      uuid references usuarios(id),
  criado_em       timestamptz not null default now(),
  concluido_em    timestamptz
);

alter table importacoes enable row level security;
create policy "tenant isolado" on importacoes
  using (tenant_id = fn_tenant_id_atual());

create index idx_importacoes_tenant on importacoes(tenant_id);
create index idx_importacoes_status on importacoes(status);

-- ─── Função: importar um lote de clientes ────────────────────
-- Chamada pela API route do Next.js com os dados já mapeados
create or replace function fn_importar_clientes(
  p_tenant_id   uuid,
  p_importacao_id uuid,
  p_clientes    jsonb,          -- array de objetos com os campos mapeados
  p_pular_dup   boolean default true,
  p_atualizar   boolean default false
)
returns jsonb language plpgsql as $$
declare
  importados  integer := 0;
  atualizados integer := 0;
  ignorados   integer := 0;
  erros       integer := 0;
  erros_lista jsonb   := '[]'::jsonb;
  cliente     jsonb;
  usuario_id  uuid;
  existe      uuid;
begin
  for cliente in select * from jsonb_array_elements(p_clientes)
  loop
    begin
      -- verifica se já existe pelo telefone
      select id into existe
      from usuarios
      where tenant_id = p_tenant_id
        and papel = 'cliente'
        and telefone = (cliente->>'telefone')
      limit 1;

      if existe is not null then
        if p_pular_dup and not p_atualizar then
          ignorados := ignorados + 1;
          continue;
        elsif p_atualizar then
          -- atualiza dados do cliente existente
          update usuarios set
            nome        = coalesce(nullif(cliente->>'nome',''), nome),
            email       = coalesce(nullif(cliente->>'email',''), email),
            aniversario = case
              when cliente->>'aniversario' ~ '^\d{4}-\d{2}-\d{2}$'
              then (cliente->>'aniversario')::date
              else aniversario
            end,
            atualizado_em = now()
          where id = existe;

          -- atualiza preferências se vieram no arquivo
          if cliente->>'tipo_corte' is not null or cliente->>'observacoes' is not null then
            insert into crm_preferencias (tenant_id, cliente_id, tipo_corte, tipo_barba, observacoes, atualizado_em)
            values (
              p_tenant_id, existe,
              case when cliente->>'tipo_corte' != '' then array[cliente->>'tipo_corte'] else null end,
              case when cliente->>'tipo_barba' != '' then array[cliente->>'tipo_barba'] else null end,
              cliente->>'observacoes',
              now()
            )
            on conflict (cliente_id) do update set
              tipo_corte  = coalesce(excluded.tipo_corte,  crm_preferencias.tipo_corte),
              tipo_barba  = coalesce(excluded.tipo_barba,  crm_preferencias.tipo_barba),
              observacoes = coalesce(excluded.observacoes, crm_preferencias.observacoes),
              atualizado_em = now();
          end if;

          atualizados := atualizados + 1;
          continue;
        end if;
      end if;

      -- insere novo cliente
      insert into usuarios (tenant_id, nome, email, telefone, papel, aniversario)
      values (
        p_tenant_id,
        coalesce(nullif(cliente->>'nome',''), 'Cliente sem nome'),
        nullif(cliente->>'email',''),
        nullif(cliente->>'telefone',''),
        'cliente',
        case
          when cliente->>'aniversario' ~ '^\d{4}-\d{2}-\d{2}$'
          then (cliente->>'aniversario')::date
          else null
        end
      )
      returning id into usuario_id;

      -- insere preferências se vieram
      if usuario_id is not null and (
        cliente->>'tipo_corte' != '' or
        cliente->>'tipo_barba' != '' or
        cliente->>'observacoes' != ''
      ) then
        insert into crm_preferencias (tenant_id, cliente_id, tipo_corte, tipo_barba, observacoes)
        values (
          p_tenant_id, usuario_id,
          case when cliente->>'tipo_corte' != '' then array[cliente->>'tipo_corte'] else null end,
          case when cliente->>'tipo_barba' != '' then array[cliente->>'tipo_barba'] else null end,
          nullif(cliente->>'observacoes','')
        );
      end if;

      importados := importados + 1;

    exception when others then
      erros := erros + 1;
      erros_lista := erros_lista || jsonb_build_object(
        'cliente', cliente->>'nome',
        'erro', SQLERRM
      );
    end;
  end loop;

  -- atualiza controle da importação
  update importacoes set
    importados    = importados,
    atualizados   = atualizados,
    ignorados     = ignorados,
    erros         = erros,
    erros_detalhe = erros_lista,
    status        = 'concluido',
    concluido_em  = now()
  where id = p_importacao_id;

  return jsonb_build_object(
    'importados',  importados,
    'atualizados', atualizados,
    'ignorados',   ignorados,
    'erros',       erros,
    'erros_lista', erros_lista
  );
end;
$$;
