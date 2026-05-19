import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function PageFinanceiro() {
  const [despesas, setDespesas] = useState([]);
  const [comissoes, setComissoes] = useState([]);
  const [aba, setAba] = useState('despesas');
  const [modalDespesa, setModalDespesa] = useState(false);
  const [form, setForm] = useState({ categoria:'', descricao:'', valor:'', competencia: new Date().toISOString().slice(0,7), recorrente: false });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0,7));

  useEffect(() => {
    supabase.from('despesas').select('*').order('competencia', { ascending: false })
      .then(({ data }) => setDespesas(data || []));
    supabase.from('comissoes').select('*').order('competencia', { ascending: false })
      .then(({ data }) => setComissoes(data || []));
  }, []);

  async function salvarDespesa() {
    const { error } = await supabase.from('despesas').insert({
      categoria: form.categoria,
      descricao: form.descricao,
      valor: parseFloat(form.valor) || 0,
      competencia: form.competencia + '-01',
      recorrente: form.recorrente,
    });
    if (error) { alert('Erro: ' + error.message); return; }
    const { data } = await supabase.from('despesas').select('*').order('competencia', { ascending: false });
    setDespesas(data || []);
    setModalDespesa(false);
    setForm({ categoria:'', descricao:'', valor:'', competencia: mesFiltro, recorrente: false });
  }

  async function excluirDespesa(id) {
    if (!confirm('Excluir esta despesa?')) return;
    await supabase.from('despesas').delete().eq('id', id);
    setDespesas(prev => prev.filter(d => d.id !== id));
  }

  const despesasFiltradas = despesas.filter(d => d.competencia?.slice(0,7) === mesFiltro);
  const comissoesFiltradas = comissoes.filter(c => c.competencia?.slice(0,7) === mesFiltro);
  const totalDespesas = despesasFiltradas.reduce((s,d) => s + Number(d.valor), 0);
  const totalComissoes = comissoesFiltradas.reduce((s,c) => s + Number(c.valor_comissao), 0);

  const categorias = ['aluguel','energia','agua','internet','produtos','marketing','equipamentos','outros'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{background:'#fff',borderBottom:'1px solid #E8E2D4',padding:'14px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:600}}>Financeiro</div>
          <div style={{fontSize:12,color:'#7A7060',marginTop:1}}>Despesas e comissões</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <input type="month" value={mesFiltro} onChange={e=>setMesFiltro(e.target.value)}
            style={{padding:'7px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}} />
          {aba === 'despesas' && (
            <button style={{background:'#B8973A',color:'#1A1610',border:'none',padding:'8px 16px',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}
              onClick={()=>setModalDespesa(true)}>+ Nova despesa</button>
          )}
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:20}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Despesas do mês',   raw:totalDespesas},
            {label:'Comissões do mês',  raw:totalComissoes},
            {label:'Total de saídas',   raw:totalDespesas+totalComissoes},
          ].map(c=>{
            const cor = c.raw === 0 ? '#B4AFA5' : c.raw > 0 ? '#1d9e75' : '#d85a30';
            return (
              <div key={c.label} style={{background:'#fff',border:'1px solid #E8E2D4',borderRadius:10,padding:16}}>
                <div style={{fontSize:11,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>{c.label}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:600,color:cor}}>
                  R$ {c.raw.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:16}}>
          {[['despesas','Despesas'],['comissoes','Comissões']].map(([a,label])=>(
            <button key={a} style={{padding:'7px 18px',borderRadius:20,border:'1px solid #E8E2D4',background:aba===a?'#1A1610':'transparent',color:aba===a?'#fff':'#7A7060',fontSize:12,cursor:'pointer',fontWeight:500}}
              onClick={()=>setAba(a)}>{label}</button>
          ))}
        </div>

        {aba === 'despesas' && (
          <div style={{background:'#fff',border:'1px solid #E8E2D4',borderRadius:10,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#FAFAF8'}}>
                  {['Descrição','Categoria','Competência','Valor','Recorrente',''].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'#7A7060',borderBottom:'1px solid #E8E2D4'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {despesasFiltradas.length === 0 && (
                  <tr><td colSpan={6} style={{padding:24,textAlign:'center',color:'#7A7060',fontSize:13}}>Nenhuma despesa cadastrada ainda.</td></tr>
                )}
                {despesasFiltradas.map(d=>(
                  <tr key={d.id} style={{borderBottom:'1px solid #E8E2D4'}}>
                    <td style={{padding:'11px 16px',fontSize:13}}>{d.descricao}</td>
                    <td style={{padding:'11px 16px',fontSize:13,textTransform:'capitalize'}}>{d.categoria}</td>
                    <td style={{padding:'11px 16px',fontSize:13}}>{d.competencia?.slice(0,7)}</td>
                    <td style={{padding:'11px 16px',fontSize:13,fontWeight:600,color:'var(--red)'}}>R$ {Number(d.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                    <td style={{padding:'11px 16px',fontSize:13}}>{d.recorrente ? '✓ Sim' : 'Nao'}</td>
                    <td style={{padding:'11px 16px'}}>
                      <button style={{background:'#FCEBEB',color:'#A32D2D',border:'none',padding:'4px 10px',borderRadius:5,fontSize:11,cursor:'pointer'}}
                        onClick={()=>excluirDespesa(d.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {aba === 'comissoes' && (
          <div style={{background:'#fff',border:'1px solid #E8E2D4',borderRadius:10,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#FAFAF8'}}>
                  {['Competencia','Faturamento base','Percentual','Comissao','Status'].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.8px',color:'#7A7060',borderBottom:'1px solid #E8E2D4'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comissoesFiltradas.length === 0 && (
                  <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:'#7A7060',fontSize:13}}>Nenhuma comissao cadastrada ainda.</td></tr>
                )}
                {comissoesFiltradas.map(c=>(
                  <tr key={c.id} style={{borderBottom:'1px solid #E8E2D4'}}>
                    <td style={{padding:'11px 16px',fontSize:13}}>{c.competencia?.slice(0,7)}</td>
                    <td style={{padding:'11px 16px',fontSize:13}}>R$ {Number(c.faturamento_base).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                    <td style={{padding:'11px 16px',fontSize:13}}>{c.percentual}%</td>
                    <td style={{padding:'11px 16px',fontSize:13,fontWeight:600,color:'var(--amber)'}}>R$ {Number(c.valor_comissao).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
                    <td style={{padding:'11px 16px',fontSize:13}}>
                      <span style={{background:c.status==='pago'?'#EAF4ED':'#FAEEDA',color:c.status==='pago'?'#2D6E3E':'#854F0B',padding:'3px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalDespesa && (
        <div style={{position:'fixed',inset:0,background:'rgba(26,22,16,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
          onClick={e=>e.target===e.currentTarget&&setModalDespesa(false)}>
          <div style={{background:'#fff',borderRadius:14,padding:24,width:480,maxWidth:'100%'}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,marginBottom:18}}>Nova despesa</div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Descricao *</label>
                <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none'}}
                  value={form.descricao} onChange={e=>set('descricao',e.target.value)} placeholder="Ex: Aluguel sala" />
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Categoria *</label>
                <select style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',background:'#fff'}}
                  value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
                  <option value="">Selecione</option>
                  {categorias.map(c=><option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Valor (R$) *</label>
                <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none'}}
                  type="number" value={form.valor} onChange={e=>set('valor',e.target.value)} placeholder="0,00" />
              </div>
              <div>
                <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Competencia</label>
                <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none'}}
                  type="month" value={form.competencia} onChange={e=>set('competencia',e.target.value)} />
              </div>
            </div>

            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}>
              <input type="checkbox" id="recorrente" checked={form.recorrente} onChange={e=>set('recorrente',e.target.checked)} />
              <label htmlFor="recorrente" style={{fontSize:13,color:'#1A1610',cursor:'pointer'}}>Despesa recorrente (mensal)</label>
            </div>

            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={{padding:'9px 18px',borderRadius:8,border:'1px solid #E8E2D4',background:'transparent',fontSize:13,cursor:'pointer'}}
                onClick={()=>setModalDespesa(false)}>Cancelar</button>
              <button style={{padding:'9px 18px',borderRadius:8,background:'#B8973A',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',color:'#1A1610'}}
                onClick={salvarDespesa}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
