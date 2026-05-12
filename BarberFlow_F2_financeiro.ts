// ============================================================
//  lib/financeiro.ts — BarberFlow Fase 2
//  Queries do módulo financeiro
// ============================================================
import { supabase } from './supabase'

const TENANT = 'a1b2c3d4-0000-0000-0000-000000000001'

// ─── DRE do mês ──────────────────────────────────────────────
export async function getDRE(competencia: string) {
  const { data, error } = await supabase
    .rpc('fn_dre_mes', {
      p_tenant_id:  TENANT,
      p_competencia: competencia,   // ex: '2026-03-01'
    })
  if (error) throw error
  return data
}

// ─── Histórico (últimos 6 meses) ─────────────────────────────
export async function getHistoricoFinanceiro() {
  const { data, error } = await supabase
    .from('vw_historico_financeiro')
    .select('*')
    .eq('tenant_id', TENANT)
    .limit(6)
  if (error) throw error
  return data
}

// ─── Gerar comissões do mês ──────────────────────────────────
export async function gerarComissoes(competencia: string) {
  const { data, error } = await supabase
    .rpc('fn_gerar_comissoes', {
      p_tenant_id:  TENANT,
      p_competencia: competencia,
    })
  if (error) throw error
  return data  // número de comissões geradas
}

// ─── Listar comissões do mês ──────────────────────────────────
export async function getComissoes(competencia: string) {
  const { data, error } = await supabase
    .from('comissoes')
    .select(`
      *,
      profissionais (
        comissao_pct,
        usuarios!usuario_id ( nome )
      )
    `)
    .eq('tenant_id', TENANT)
    .eq('competencia', competencia)
    .order('valor_comissao', { ascending: false })
  if (error) throw error
  return data
}

// ─── Marcar comissão como paga ────────────────────────────────
export async function pagarComissao(id: string) {
  const { error } = await supabase
    .from('comissoes')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('id', id)
    .eq('tenant_id', TENANT)
  if (error) throw error
}

// ─── Inadimplentes ───────────────────────────────────────────
export async function getInadimplentes() {
  const { data, error } = await supabase
    .rpc('fn_inadimplentes', { p_tenant_id: TENANT })
  if (error) throw error
  return data
}

// ─── Cancelar assinatura inadimplente ────────────────────────
export async function cancelarAssinatura(assinatura_id: string, motivo: string) {
  const { error } = await supabase
    .from('assinaturas')
    .update({
      status: 'cancelada',
      cancelado_em: new Date().toISOString().split('T')[0],
      motivo_cancelamento: motivo,
    })
    .eq('id', assinatura_id)
    .eq('tenant_id', TENANT)
  if (error) throw error
}

// ─── Previsão de faturamento ─────────────────────────────────
export async function getPrevisao(meses = 3) {
  const { data, error } = await supabase
    .rpc('fn_previsao_faturamento', {
      p_tenant_id: TENANT,
      p_meses: meses,
    })
  if (error) throw error
  return data
}

// ─── Salvar despesa ──────────────────────────────────────────
export async function salvarDespesa(despesa: {
  categoria: string
  descricao: string
  valor: number
  competencia: string
  recorrente?: boolean
}) {
  const { data, error } = await supabase
    .from('despesas')
    .insert({ ...despesa, tenant_id: TENANT })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Listar despesas do mês ───────────────────────────────────
export async function getDespesas(competencia: string) {
  const { data, error } = await supabase
    .from('despesas')
    .select('*')
    .eq('tenant_id', TENANT)
    .eq('competencia', competencia)
    .order('categoria')
  if (error) throw error
  return data
}

// ─── Meta do mês ─────────────────────────────────────────────
export async function getMeta(competencia: string) {
  const { data, error } = await supabase
    .from('metas')
    .select('*')
    .eq('tenant_id', TENANT)
    .eq('competencia', competencia)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function salvarMeta(competencia: string, meta_total: number) {
  const { error } = await supabase
    .from('metas')
    .upsert({ tenant_id: TENANT, competencia, meta_total },
             { onConflict: 'tenant_id,competencia' })
  if (error) throw error
}
