import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://zfcflcetvrbfoklnkxhj.supabase.co', 'sb_publishable_YhYV39JQfH5holo-KrbkSw_fERerjpr')

async function verify() {
  console.log("--- VERIFICAÇÃO FINAL DE DISTRIBUIÇÃO ---")
  
  // 1. Verificar se o tenant principal existe e é visível
  const { data: tenants, error: e1 } = await supabase.from('tenants').select('*').eq('slug', 'barberflow')
  console.log("1. Tenant 'barberflow' visível?", tenants?.length > 0 ? "SIM" : "NÃO", e1 || "")

  // 2. Verificar se o perfil da barbearia está acessível
  const { data: perfis, error: e2 } = await supabase.from('barbearia_perfis').select('nome, slug, tenant_id')
  console.log("2. Perfis acessíveis:", perfis?.map(p => p.slug), e2 || "")

  // 3. Verificar se há profissionais para o tenant (necessário para o PWA agendar)
  if (perfis && perfis.length > 0) {
    const tid = perfis[0].tenant_id
    const { data: profs, error: e3 } = await supabase.from('profissionais').select('*').eq('tenant_id', tid)
    console.log(`3. Profissionais no tenant ${perfis[0].slug}:`, profs?.length || 0, e3 || "")
  }

  // 4. Verificar se a função RPC de tenant_id está funcionando (essencial para o Admin)
  // Nota: Isso pode falhar se não houver um usuário logado no contexto do script, 
  // mas vamos testar a existência da função.
  const { error: e4 } = await supabase.rpc('fn_tenant_id_atual')
  console.log("4. RPC fn_tenant_id_atual status:", e4?.code === 'P0001' ? "OK (Precisa de login)" : "ERRO " + (e4?.message || "Desconhecido"))
}

verify()
