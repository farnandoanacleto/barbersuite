// ============================================================
//  lib/financeiro.ts — BarberFlow Fase 2
//  Queries do módulo financeiro
//  Todas as funções retornam null em falha (nunca jogam exceção)
//  para que o componente use dados mock como fallback silencioso.
// ============================================================
import { supabase } from './supabase'

const TENANT = 'a1b2c3d4-0000-0000-0000-000000000001'

// ─── DRE do mês ──────────────────────────────────────────────
export async function getDRE(competencia: string) {
  try {
    const { data, error } = await supabase
      .rpc('fn_dre_mes', {
        p_tenant_id:   TENANT,
        p_competencia: competencia,  // ex: '2026-03-01'
      })
    if (error) throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] getDRE:', e?.message ?? e)
    return null
  }
}

// ─── Histórico (últimos 6 meses) ─────────────────────────────
export async function getHistoricoFinanceiro() {
  try {
    const { data, error } = await supabase
      .from('vw_historico_financeiro')
      .select('*')
      .eq('tenant_id', TENANT)
      .limit(6)
    if (error) throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] getHistoricoFinanceiro:', e?.message ?? e)
    return null
  }
}

// ─── Gerar comissões do mês ──────────────────────────────────
export async function gerarComissoes(competencia: string) {
  try {
    const { data, error } = await supabase
      .rpc('fn_gerar_comissoes', {
        p_tenant_id:   TENANT,
        p_competencia: competencia,
      })
    if (error) throw error
    return data   // número de comissões geradas
  } catch (e: any) {
    console.warn('[BarberFlow] gerarComissoes:', e?.message ?? e)
    return null
  }
}

// ─── Listar comissões do mês ──────────────────────────────────
export async function getComissoes(competencia: string) {
  try {
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
  } catch (e: any) {
    console.warn('[BarberFlow] getComissoes:', e?.message ?? e)
    return null
  }
}

// ─── Marcar comissão como paga ────────────────────────────────
export async function pagarComissao(id: string) {
  try {
    const { error } = await supabase
      .from('comissoes')
      .update({ status: 'pago', pago_em: new Date().toISOString() })
      .eq('id', id)
      .eq('tenant_id', TENANT)
    if (error) throw error
  } catch (e: any) {
    console.warn('[BarberFlow] pagarComissao:', e?.message ?? e)
  }
}

// ─── Inadimplentes ───────────────────────────────────────────
export async function getInadimplentes() {
  try {
    const { data, error } = await supabase
      .rpc('fn_inadimplentes', { p_tenant_id: TENANT })
    if (error) throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] getInadimplentes:', e?.message ?? e)
    return null
  }
}

// ─── Cancelar assinatura inadimplente ────────────────────────
export async function cancelarAssinatura(assinatura_id: string, motivo: string) {
  try {
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
  } catch (e: any) {
    console.warn('[BarberFlow] cancelarAssinatura:', e?.message ?? e)
  }
}

// ─── Previsão de faturamento ─────────────────────────────────
export async function getPrevisao(meses = 3) {
  try {
    const { data, error } = await supabase
      .rpc('fn_previsao_faturamento', {
        p_tenant_id: TENANT,
        p_meses:     meses,
      })
    if (error) throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] getPrevisao:', e?.message ?? e)
    return null
  }
}

// ─── Salvar despesa ──────────────────────────────────────────
export async function salvarDespesa(despesa: {
  categoria: string
  descricao: string
  valor: number
  competencia: string
  recorrente?: boolean
}) {
  try {
    const { data, error } = await supabase
      .from('despesas')
      .insert({ ...despesa, tenant_id: TENANT })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] salvarDespesa:', e?.message ?? e)
    return null
  }
}

// ─── Listar despesas do mês ───────────────────────────────────
export async function getDespesas(competencia: string) {
  try {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('tenant_id', TENANT)
      .eq('competencia', competencia)
      .order('categoria')
    if (error) throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] getDespesas:', e?.message ?? e)
    return null
  }
}

// ─── Meta do mês ─────────────────────────────────────────────
export async function getMeta(competencia: string) {
  try {
    const { data, error } = await supabase
      .from('metas')
      .select('*')
      .eq('tenant_id', TENANT)
      .eq('competencia', competencia)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  } catch (e: any) {
    console.warn('[BarberFlow] getMeta:', e?.message ?? e)
    return null
  }
}

export async function salvarMeta(competencia: string, meta_total: number) {
  try {
    const { error } = await supabase
      .from('metas')
      .upsert({ tenant_id: TENANT, competencia, meta_total },
               { onConflict: 'tenant_id,competencia' })
    if (error) throw error
  } catch (e: any) {
    console.warn('[BarberFlow] salvarMeta:', e?.message ?? e)
  }
}
