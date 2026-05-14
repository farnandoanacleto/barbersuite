import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

function jwtSub(token: string): string {
  try {
    return JSON.parse(atob(token.split('.')[1])).sub as string;
  } catch {
    return '';
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Não autorizado');

    const token = authHeader.replace('Bearer ', '');
    const userId = jwtSub(token);
    if (!userId) throw new Error('Token inválido');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: perfil } = await supabase
      .from('barbearia_perfis')
      .select('id, tenant_id, plano_saas')
      .eq('auth_user_id', userId)
      .single();

    if (!perfil) throw new Error('Perfil não encontrado');
    if (perfil.plano_saas !== 'enterprise') {
      return new Response(JSON.stringify({ error: 'Plano Enterprise requerido' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tenantId = perfil.tenant_id;
    const agora = new Date();

    const umMesAtras = new Date(agora);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const doisMesesAtras = new Date(agora);
    doisMesesAtras.setMonth(doisMesesAtras.getMonth() - 2);

    const trintaDiasAtras = new Date(agora);
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const quinzeDiasAtras = new Date(agora);
    quinzeDiasAtras.setDate(quinzeDiasAtras.getDate() - 15);

    const [agendamentosRes, usuariosRes, servicosRes, assinaturasRes] = await Promise.all([
      supabase.from('agendamentos')
        .select('id, data_hora, status, cliente_id, servico_id')
        .eq('tenant_id', tenantId)
        .gte('data_hora', doisMesesAtras.toISOString())
        .order('data_hora', { ascending: false }),
      supabase.from('usuarios')
        .select('id, nome')
        .eq('tenant_id', tenantId)
        .eq('papel', 'cliente'),
      supabase.from('servicos')
        .select('id, nome, preco')
        .eq('ativo', true),
      supabase.from('assinaturas')
        .select('cliente_id')
        .eq('tenant_id', tenantId)
        .eq('status', 'ativa'),
    ]);

    const agendamentos: any[] = agendamentosRes.data || [];
    const usuarios: any[] = usuariosRes.data || [];
    const servicos: any[] = servicosRes.data || [];
    const assinaturas: any[] = assinaturasRes.data || [];
    const assinantesIds = new Set(assinaturas.map((a) => a.cliente_id));

    const agendMesAtual = agendamentos.filter((a) =>
      new Date(a.data_hora) >= umMesAtras && a.status === 'concluido'
    );
    const agendMesAnterior = agendamentos.filter((a) =>
      new Date(a.data_hora) >= doisMesesAtras &&
      new Date(a.data_hora) < umMesAtras &&
      a.status === 'concluido'
    );

    const precoPorServico: Record<string, number> = {};
    servicos.forEach((s) => { precoPorServico[s.id] = Number(s.preco) || 0; });

    const calcTicket = (agends: any[]) => {
      if (!agends.length) return 0;
      return agends.reduce((sum, a) => sum + (precoPorServico[a.servico_id] || 0), 0) / agends.length;
    };

    const ticketAtual = calcTicket(agendMesAtual);
    const ticketAnterior = calcTicket(agendMesAnterior);

    const ultimaVisita: Record<string, string> = {};
    agendamentos.forEach((a) => {
      if (a.cliente_id && (!ultimaVisita[a.cliente_id] || a.data_hora > ultimaVisita[a.cliente_id])) {
        ultimaVisita[a.cliente_id] = a.data_hora;
      }
    });

    const clientesInativos = usuarios
      .filter((u) => {
        const ultima = ultimaVisita[u.id];
        return ultima && new Date(ultima) < trintaDiasAtras;
      })
      .slice(0, 8);

    const assinantesEmRisco = usuarios
      .filter((u) => {
        if (!assinantesIds.has(u.id)) return false;
        const ultima = ultimaVisita[u.id];
        return ultima && new Date(ultima) < quinzeDiasAtras;
      })
      .slice(0, 5);

    const contMesAtual: Record<string, number> = {};
    const contMesAnterior: Record<string, number> = {};
    agendMesAtual.forEach((a) => {
      if (a.servico_id) contMesAtual[a.servico_id] = (contMesAtual[a.servico_id] || 0) + 1;
    });
    agendMesAnterior.forEach((a) => {
      if (a.servico_id) contMesAnterior[a.servico_id] = (contMesAnterior[a.servico_id] || 0) + 1;
    });

    const tendencias = servicos
      .map((s) => ({
        nome: s.nome,
        atual: contMesAtual[s.id] || 0,
        anterior: contMesAnterior[s.id] || 0,
      }))
      .filter((t) => t.atual > 0 || t.anterior > 0);

    const mesAtual = agora.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    const mesAnterior = umMesAtras.toLocaleString('pt-BR', { month: 'long' });

    const prompt = `Você é um consultor especialista em gestão de barbearias no Brasil. Analise os dados e gere insights acionáveis em português brasileiro, direto e prático.

PERÍODO: ${mesAtual}

TICKET MÉDIO:
- Este mês: R$ ${ticketAtual.toFixed(2)} (${agendMesAtual.length} atendimentos concluídos)
- Mês anterior (${mesAnterior}): R$ ${ticketAnterior.toFixed(2)} (${agendMesAnterior.length} atendimentos)

CLIENTES INATIVOS (sem visita há +30 dias): ${clientesInativos.length}
Exemplos: ${clientesInativos.slice(0, 5).map((c) => c.nome).join(', ') || 'nenhum identificado'}

ASSINANTES DO CLUBE EM RISCO (sem visita há +15 dias): ${assinantesEmRisco.length}
Nomes: ${assinantesEmRisco.map((c) => c.nome).join(', ') || 'nenhum'}

SERVIÇOS — este mês vs mês anterior:
${tendencias.map((t) => `- ${t.nome}: ${t.atual} vs ${t.anterior}`).join('\n') || '- Sem dados suficientes'}

Responda APENAS com JSON puro (sem markdown, sem blocos de código), neste formato exato:
{"ticket_medio":{"status":"alta|queda|estavel","resumo":"1 frase impactante","analise":"2-3 frases de análise concreta","acoes":["ação 1","ação 2","ação 3"]},"clientes_inativos":{"resumo":"1 frase impactante","analise":"2-3 frases de análise concreta","acoes":["ação 1","ação 2"]},"tendencia_servicos":{"resumo":"1 frase impactante","crescendo":["nome1"],"caindo":["nome1"],"analise":"2-3 frases de análise concreta","acoes":["ação 1","ação 2"]}}`;

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY não configurada nos secrets');

    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!aiRes.ok) throw new Error(`Anthropic API error: ${await aiRes.text()}`);

    const aiData = await aiRes.json();
    const rawContent = aiData.content?.[0]?.text || '{}';
    const cleaned = rawContent.replace(/^```(?:json)?\s*|\s*```$/gm, '').trim();

    let insights: any;
    try {
      insights = JSON.parse(cleaned);
    } catch {
      throw new Error('Resposta inválida da IA — tente novamente');
    }

    return new Response(JSON.stringify({
      insights,
      stats: {
        ticket_atual: ticketAtual,
        ticket_anterior: ticketAnterior,
        atendimentos_mes: agendMesAtual.length,
        clientes_inativos: clientesInativos.length,
        assinantes_risco: assinantesEmRisco.length,
        nomes_inativos: clientesInativos.slice(0, 5).map((c) => c.nome),
        nomes_risco: assinantesEmRisco.map((c) => c.nome),
      },
      gerado_em: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
