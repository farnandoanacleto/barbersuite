import { useState } from "react";
import { supabase } from "../lib/supabase";

function exportarCSV(dados, nomeArquivo) {
  if (!dados || dados.length === 0) { alert('Nenhum dado para exportar.'); return; }
  const cabecalho = Object.keys(dados[0]).join(',');
  const linhas = dados.map(row =>
    Object.values(row).map(val => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [cabecalho, ...linhas].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function PageRelatorios() {
  const [mesInicio, setMesInicio] = useState(new Date().toISOString().slice(0,7));
  const [mesFim, setMesFim] = useState(new Date().toISOString().slice(0,7));
  const [carregando, setCarregando] = useState('');

  async function gerarAgendamentos() {
    setCarregando('agendamentos');
    const { data } = await supabase.from('agendamentos').select('*')
      .gte('dia', mesInicio + '-01').lte('dia', mesFim + '-31')
      .order('dia', { ascending: false });
    exportarCSV((data || []).map(a => ({
      Data: a.dia,
      Horario: a.hora,
      Cliente: a.cliente_nome,
      Servico: a.servico_nome || a.servico,
      Barbeiro: a.barbeiro_nome,
      Status: a.status,
    })), `agendamentos_${mesInicio}_${mesFim}`);
    setCarregando('');
  }

  async function gerarFinanceiro() {
    setCarregando('financeiro');
    const { data } = await supabase.from('despesas').select('*')
      .gte('competencia', mesInicio + '-01').lte('competencia', mesFim + '-31')
      .order('competencia', { ascending: false });
    exportarCSV((data || []).map(d => ({
      Competencia: d.competencia?.slice(0,7),
      Categoria: d.categoria,
      Descricao: d.descricao,
      Valor: Number(d.valor).toFixed(2),
      Recorrente: d.recorrente ? 'Sim' : 'Nao',
    })), `financeiro_${mesInicio}_${mesFim}`);
    setCarregando('');
  }

  async function gerarClientes() {
    setCarregando('clientes');
    const { data } = await supabase.from('clientes').select('*').order('nome');
    exportarCSV((data || []).map(c => ({
      Nome: c.nome,
      Telefone: c.telefone,
      Email: c.email || '',
      Plano: c.plano || 'Avulso',
      Aniversario: c.aniversario || '',
      Observacao: c.observacao || '',
      Cadastrado_em: c.created_at?.slice(0,10),
    })), `clientes_${new Date().toISOString().slice(0,10)}`);
    setCarregando('');
  }

  async function gerarComissoes() {
    setCarregando('comissoes');
    const { data } = await supabase.from('comissoes').select('*')
      .gte('competencia', mesInicio + '-01').lte('competencia', mesFim + '-31')
      .order('competencia', { ascending: false });
    exportarCSV((data || []).map(c => ({
      Competencia: c.competencia?.slice(0,7),
      Faturamento_base: Number(c.faturamento_base).toFixed(2),
      Percentual: c.percentual + '%',
      Valor_comissao: Number(c.valor_comissao).toFixed(2),
      Status: c.status,
      Pago_em: c.pago_em?.slice(0,10) || '',
    })), `comissoes_${mesInicio}_${mesFim}`);
    setCarregando('');
  }

  async function gerarClube() {
    setCarregando('clube');
    const { data } = await supabase.from('assinaturas')
      .select('*, clientes(nome, telefone, email), planos(nome, preco)')
      .order('criado_em', { ascending: false });
    exportarCSV((data || []).map(a => ({
      Cliente: a.clientes?.nome || '',
      Telefone: a.clientes?.telefone || '',
      Email: a.clientes?.email || '',
      Plano: a.planos?.nome || '',
      Valor_mensal: Number(a.planos?.preco || 0).toFixed(2),
      Status: a.status,
      Inicio: a.inicio,
      Uso_mes: a.uso_mes_atual || 0,
      Proximo_pagamento: a.proximo_pagamento || '',
    })), `clube_${new Date().toISOString().slice(0,10)}`);
    setCarregando('');
  }

  const relatorios = [
    {
      key: 'agendamentos',
      titulo: 'Agendamentos',
      descricao: 'Lista de todos os agendamentos no periodo selecionado com cliente, servico, barbeiro e status.',
      icone: '📅',
      acao: gerarAgendamentos,
      usaFiltro: true,
    },
    {
      key: 'financeiro',
      titulo: 'Financeiro',
      descricao: 'Despesas por categoria e competencia no periodo selecionado.',
      icone: '💰',
      acao: gerarFinanceiro,
      usaFiltro: true,
    },
    {
      key: 'clientes',
      titulo: 'Clientes',
      descricao: 'Lista completa de todos os clientes cadastrados com plano e informacoes de contato.',
      icone: '👥',
      acao: gerarClientes,
      usaFiltro: false,
    },
    {
      key: 'comissoes',
      titulo: 'Comissoes',
      descricao: 'Comissoes por barbeiro no periodo selecionado com faturamento base e valor pago.',
      icone: '💼',
      acao: gerarComissoes,
      usaFiltro: true,
    },
    {
      key: 'clube',
      titulo: 'Clube de assinatura',
      descricao: 'Lista completa de membros do clube com plano, status e uso do mes.',
      icone: '♛',
      acao: gerarClube,
      usaFiltro: false,
    },
  ];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'#fff',borderBottom:'1px solid #E8E2D4',padding:'14px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600}}>Relatorios</div>
          <div style={{fontSize:12,color:'#7A7060',marginTop:1}}>Exportar dados em CSV</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <label style={{fontSize:11,color:'#7A7060',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>De</label>
            <input type="month" value={mesInicio} onChange={e=>setMesInicio(e.target.value)}
              style={{padding:'7px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}} />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <label style={{fontSize:11,color:'#7A7060',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>Ate</label>
            <input type="month" value={mesFim} onChange={e=>setMesFim(e.target.value)}
              style={{padding:'7px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}} />
          </div>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:20}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {relatorios.map(r=>(
            <div key={r.key} style={{background:'#fff',border:'1px solid #E8E2D4',borderRadius:12,padding:20,display:'flex',flexDirection:'column',gap:12}}>
              <div style={{fontSize:28}}>{r.icone}</div>
              <div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,marginBottom:6}}>{r.titulo}</div>
                <div style={{fontSize:12,color:'#7A7060',lineHeight:1.6}}>{r.descricao}</div>
              </div>
              {r.usaFiltro && (
                <div style={{fontSize:11,color:'#B4AFA5',background:'#FAFAF8',borderRadius:6,padding:'6px 10px'}}>
                  Periodo: {mesInicio} ate {mesFim}
                </div>
              )}
              <button
                style={{marginTop:'auto',background:carregando===r.key?'#E8E2D4':'#B8973A',color:carregando===r.key?'#7A7060':'#1A1610',border:'none',padding:'10px 16px',borderRadius:7,fontSize:13,fontWeight:600,cursor:carregando===r.key?'not-allowed':'pointer',transition:'all 0.15s'}}
                disabled={carregando===r.key}
                onClick={r.acao}>
                {carregando===r.key ? 'Gerando...' : 'Exportar CSV'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
