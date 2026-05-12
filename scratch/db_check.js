import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://zfcflcetvrbfoklnkxhj.supabase.co', 'sb_publishable_YhYV39JQfH5holo-KrbkSw_fERerjpr')

async function test() {
  console.log("--- DIAGNÓSTICO DETALHADO ---")
  
  const { data: perfis } = await supabase.from('barbearia_perfis').select('id, tenant_id, nome, slug')
  console.log("Perfis encontrados:", perfis)

  if (perfis && perfis.length > 0) {
    const tid = perfis[0].tenant_id
    console.log("Tentando buscar tenant por ID:", tid)
    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tid)
    console.log("Tenant resultado:", tenant)
  }
}

test()
