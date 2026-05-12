// ============================================================
//  lib/supabase.ts  —  BarberFlow
//  Instale: npm install @supabase/supabase-js
//  Variáveis no .env.local:
//    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
//    NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
// ============================================================

import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Tenant fixo (Fase 1 — BarberFlow) ──────────────────
const TENANT_ID = 'a1b2c3d4-0000-0000-0000-000000000001'

// ============================================================
//  AGENDA
// ============================================================

/** Retorna todos os agendamentos de hoje agrupados por barbeiro */
export async function getAgendaHoje() {
  const { data, error } = await supabase
    .from('vw_agenda_hoje')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .order('inicio')

  if (error) throw error
  return data
}

/** Cria um novo agendamento com verificação de conflito */
export async function criarAgendamento(payload: {
  cliente_id: string
  profissional_id: string
  servico_id: string
  inicio: string   // ISO 8601
  fim: string
  observacoes?: string
  origem?: 'manual' | 'online' | 'whatsapp' | 'encaixe'
}) {
  // 1. verifica conflito
  const { data: conflito } = await supabase
    .rpc('fn_tem_conflito', {
      p_profissional_id: payload.profissional_id,
      p_inicio: payload.inicio,
      p_fim: payload.fim,
    })

  if (conflito) throw new Error('Horário já ocupado para este profissional.')

  // 2. cria agendamento
  const { data, error } = await supabase
    .from('agendamentos')
    .insert({ ...payload, tenant_id: TENANT_ID, status: 'pendente' })
    .select()
    .single()

  if (error) throw error

  // 3. agenda lembrete WhatsApp (chamada para a sua API route)
  await fetch('/api/whatsapp/agendar-lembrete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agendamento_id: data.id }),
  })

  return data
}

/** Atualiza status de um agendamento */
export async function atualizarStatusAgendamento(
  id: string,
  status: 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'no_show'
) {
  const { data, error } = await supabase
    .from('agendamentos')
    .update({ status })
    .eq('id', id)
    .eq('tenant_id', TENANT_ID)
    .select()
    .single()

  if (error) throw error

  // registra no-show automaticamente
  if (status === 'no_show') {
    await supabase.from('no_shows').insert({
      tenant_id: TENANT_ID,
      agendamento_id: id,
      cliente_id: data.cliente_id,
    })
  }

  return data
}

/** Slots disponíveis para encaixe */
export async function getSlotsDisponiveis(
  profissional_id: string,
  data: string,      // YYYY-MM-DD
  duracao_min: number
) {
  const { data: slots, error } = await supabase.rpc('fn_slots_disponiveis', {
    p_profissional_id: profissional_id,
    p_data: data,
    p_duracao: duracao_min,
  })

  if (error) throw error
  return slots as { slot_inicio: string }[]
}

// ============================================================
//  LISTA DE ESPERA
// ============================================================

export async function getListaEspera() {
  const { data, error } = await supabase
    .from('lista_espera')
    .select(`
      *,
      usuarios!cliente_id ( nome, telefone ),
      servicos ( nome, duracao_min ),
      profissionais ( usuarios!usuario_id ( nome ) )
    `)
    .eq('tenant_id', TENANT_ID)
    .eq('notificado', false)
    .eq('expirado', false)
    .order('solicitado_em')

  if (error) throw error
  return data
}

export async function notificarListaEspera(id: string) {
  const { error } = await supabase
    .from('lista_espera')
    .update({ notificado: true, notificado_em: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  // dispara WhatsApp
  await fetch('/api/whatsapp/notificar-espera', {
    method: 'POST',
    body: JSON.stringify({ lista_espera_id: id }),
    headers: { 'Content-Type': 'application/json' },
  })
}

// ============================================================
//  CLIENTES / CRM
// ============================================================

/** Lista de clientes com filtro de busca */
export async function getClientes(busca?: string) {
  let query = supabase
    .from('usuarios')
    .select(`
      id, nome, email, telefone, aniversario, foto_url,
      crm_preferencias ( profissional_preferido, tipo_corte, tipo_barba, extras_aceitos, observacoes, nps_ultimo ),
      assinaturas ( status, uso_mes_atual, planos_clube ( nome ) )
    `)
    .eq('tenant_id', TENANT_ID)
    .eq('papel', 'cliente')
    .eq('ativo', true)
    .order('nome')

  if (busca) {
    query = query.or(`nome.ilike.%${busca}%,telefone.ilike.%${busca}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

/** Estatísticas completas de um cliente (para o card CRM) */
export async function getStatsCliente(cliente_id: string) {
  const { data, error } = await supabase.rpc('fn_stats_cliente', {
    p_cliente_id: cliente_id,
    p_tenant_id: TENANT_ID,
  })

  if (error) throw error
  return data?.[0]
}

/** Histórico de visitas de um cliente */
export async function getHistoricoCliente(cliente_id: string, limit = 20) {
  const { data, error } = await supabase
    .from('agendamentos')
    .select(`
      id, inicio, status,
      servicos ( nome, preco ),
      profissionais ( usuarios!usuario_id ( nome ) ),
      pagamentos ( valor, status )
    `)
    .eq('cliente_id', cliente_id)
    .eq('tenant_id', TENANT_ID)
    .eq('status', 'concluido')
    .order('inicio', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

/** Salvar ou atualizar preferências do cliente */
export async function salvarPreferenciasCliente(
  cliente_id: string,
  prefs: {
    tipo_corte?: string[]
    tipo_barba?: string[]
    extras_aceitos?: string[]
    observacoes?: string
    alergias?: string
    profissional_preferido?: string
  }
) {
  const { data, error } = await supabase
    .from('crm_preferencias')
    .upsert({
      tenant_id: TENANT_ID,
      cliente_id,
      ...prefs,
      atualizado_em: new Date().toISOString(),
    }, { onConflict: 'cliente_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
//  CLUBE DE ASSINATURA
// ============================================================

/** Todos os planos disponíveis */
export async function getPlanos() {
  const { data, error } = await supabase
    .from('planos_clube')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .eq('ativo', true)
    .order('preco_mensal')

  if (error) throw error
  return data
}

/** Membros do clube com score de churn */
export async function getMembrosClube(ordenar: 'churn' | 'nome' | 'plano' = 'churn') {
  const coluna = ordenar === 'churn' ? 'score_churn' : ordenar === 'nome' ? 'usuarios.nome' : 'planos_clube.nome'

  const { data, error } = await supabase
    .from('assinaturas')
    .select(`
      id, status, uso_mes_atual, score_churn, inicio, proximo_pagamento,
      usuarios!cliente_id ( nome, telefone, email ),
      planos_clube ( nome, preco_mensal, visitas_mes )
    `)
    .eq('tenant_id', TENANT_ID)
    .in('status', ['ativa', 'inadimplente'])
    .order('score_churn', { ascending: false })

  if (error) throw error
  return data
}

/** Clientes em risco de churn (score > 60) */
export async function getClientesChurn() {
  const { data, error } = await supabase
    .from('assinaturas')
    .select(`
      id, score_churn, uso_mes_atual,
      usuarios!cliente_id ( nome, telefone ),
      planos_clube ( nome )
    `)
    .eq('tenant_id', TENANT_ID)
    .eq('status', 'ativa')
    .gt('score_churn', 60)
    .order('score_churn', { ascending: false })

  if (error) throw error
  return data
}

/** Candidatos a upgrade (chegaram no limite do plano) */
export async function getCandidatosUpgrade() {
  const { data, error } = await supabase
    .from('assinaturas')
    .select(`
      id, uso_mes_atual,
      usuarios!cliente_id ( nome, telefone ),
      planos_clube ( nome, visitas_mes, preco_mensal )
    `)
    .eq('tenant_id', TENANT_ID)
    .eq('status', 'ativa')
    .not('planos_clube.visitas_mes', 'is', null)

  if (error) throw error

  // filtra os que atingiram ou ultrapassaram o limite
  return (data ?? []).filter((a: any) =>
    a.uso_mes_atual >= (a.planos_clube?.visitas_mes ?? Infinity)
  )
}

/** Incrementar uso mensal quando agendamento é concluído */
export async function incrementarUsoClube(cliente_id: string) {
  const { data: assinatura } = await supabase
    .from('assinaturas')
    .select('id, uso_mes_atual')
    .eq('cliente_id', cliente_id)
    .eq('tenant_id', TENANT_ID)
    .eq('status', 'ativa')
    .single()

  if (!assinatura) return

  await supabase
    .from('assinaturas')
    .update({ uso_mes_atual: assinatura.uso_mes_atual + 1 })
    .eq('id', assinatura.id)
}

// ============================================================
//  DASHBOARD
// ============================================================

/** KPIs do mês atual */
export async function getKPIsMes() {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const [pagamentos, agendamentos, membros] = await Promise.all([
    // faturamento
    supabase
      .from('pagamentos')
      .select('valor')
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'pago')
      .gte('pago_em', inicioMes.toISOString()),

    // atendimentos
    supabase
      .from('agendamentos')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'concluido')
      .gte('inicio', inicioMes.toISOString()),

    // total membros clube
    supabase
      .from('assinaturas')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', TENANT_ID)
      .eq('status', 'ativa'),
  ])

  const faturamento = (pagamentos.data ?? []).reduce((s, p) => s + Number(p.valor), 0)

  return {
    faturamento,
    atendimentos: agendamentos.count ?? 0,
    total_membros: membros.count ?? 0,
  }
}

/** Ranking dos profissionais no mês */
export async function getRankingProfissionais() {
  const { data, error } = await supabase.rpc('fn_dashboard_profissionais', {
    p_tenant_id: TENANT_ID,
  })

  if (error) throw error
  return (data ?? []).sort((a: any, b: any) => b.faturamento - a.faturamento)
}

// ============================================================
//  REALTIME (Supabase Realtime)
//  Cole isso no seu componente de agenda:
// ============================================================
/*
import { useEffect, useState } from 'react'
import { supabase, getAgendaHoje } from '@/lib/supabase'

export function useAgendaRealtime() {
  const [agenda, setAgenda] = useState([])

  useEffect(() => {
    getAgendaHoje().then(setAgenda)

    const channel = supabase
      .channel('agenda-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agendamentos',
      }, () => {
        getAgendaHoje().then(setAgenda)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return agenda
}
*/
