import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Receipt } from 'lucide-react';

function Badge({ tipo, children }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>;
}

export default function PageComandas() {
  const [comandas, setComandas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  const [modalNovaComanda, setModalNovaComanda] = useState(false);
  const [modalComandaDetalhe, setModalComandaDetalhe] = useState(false);
  const [comandaSelecionada, setComandaSelecionada] = useState(null);
  const [itensComanda, setItensComanda] = useState([]);

  // Forms
  const [novoClienteId, setNovoClienteId] = useState('');
  const [formItem, setFormItem] = useState({ tipo: 'produto', id: '', quantidade: 1 });
  const [formPagamento, setFormPagamento] = useState({ metodo: 'dinheiro', desconto: 0 });

  useEffect(() => {
    carregarDadosBase();
    carregarComandas();
  }, []);

  async function carregarDadosBase() {
    const [{ data: cData }, { data: pData }, { data: sData }] = await Promise.all([
      supabase.from('usuarios').select('id, nome').eq('papel', 'cliente').order('nome'),
      supabase.from('produtos').select('id, nome, preco_venda, quantidade_estoque').gt('quantidade_estoque', 0).eq('ativo', true).order('nome'),
      supabase.from('servicos').select('id, nome, preco').eq('ativo', true).order('nome')
    ]);
    if (cData) setClientes(cData);
    if (pData) setProdutos(pData);
    if (sData) setServicos(sData);
  }

  async function carregarComandas() {
    const { data } = await supabase.from('comandas')
      .select('*, usuarios!comandas_cliente_id_fkey(nome)')
      .eq('status', 'aberta')
      .order('aberta_em', { ascending: false });
    if (data) setComandas(data);
  }

  async function carregarItens(comanda_id) {
    const { data } = await supabase.from('comanda_itens')
      .select('*')
      .eq('comanda_id', comanda_id)
      .order('criado_em', { ascending: true });
    setItensComanda(data || []);
  }

  async function abrirComanda() {
    if (!novoClienteId) return alert("Selecione um cliente");
    const { data: tenantData } = await supabase.rpc('fn_tenant_id_atual');
    const { error } = await supabase.from('comandas').insert([{
      tenant_id: tenantData,
      cliente_id: novoClienteId,
      status: 'aberta'
    }]);

    if (!error) {
      setModalNovaComanda(false);
      setNovoClienteId('');
      carregarComandas();
    } else {
      alert("Erro ao abrir comanda: " + error.message);
    }
  }

  async function abrirDetalhe(comanda) {
    setComandaSelecionada(comanda);
    setModalComandaDetalhe(true);
    carregarItens(comanda.id);
  }

  async function adicionarItem() {
    if (!formItem.id) return alert("Selecione um item");
    const qtd = Number(formItem.quantidade);
    if (qtd <= 0) return alert("Quantidade inválida");

    let nome_item = '';
    let preco_unitario = 0;
    let produto_id = null;
    let servico_id = null;

    if (formItem.tipo === 'produto') {
      const prod = produtos.find(p => p.id === formItem.id);
      if (!prod) return;
      nome_item = prod.nome;
      preco_unitario = prod.preco_venda;
      produto_id = prod.id;
    } else {
      const serv = servicos.find(s => s.id === formItem.id);
      if (!serv) return;
      nome_item = serv.nome;
      preco_unitario = serv.preco;
      servico_id = serv.id;
    }

    const subtotal = preco_unitario * qtd;
    const { data: tenantData } = await supabase.rpc('fn_tenant_id_atual');

    const { error } = await supabase.from('comanda_itens').insert([{
      tenant_id: tenantData,
      comanda_id: comandaSelecionada.id,
      produto_id,
      servico_id,
      nome_item,
      quantidade: qtd,
      preco_unitario,
      subtotal
    }]);

    if (!error) {
      // Se for produto, dar baixa no estoque
      if (produto_id) {
        const prod = produtos.find(p => p.id === produto_id);
        await supabase.from('produtos').update({ quantidade_estoque: prod.quantidade_estoque - qtd }).eq('id', produto_id);
        
        await supabase.from('estoque_movimentacoes').insert([{
          tenant_id: tenantData,
          produto_id,
          tipo: 'saida',
          quantidade: qtd,
          motivo: `Venda Comanda #${comandaSelecionada.id.split('-')[0]}`
        }]);
        carregarDadosBase(); // recarrega estoques
      }

      // Atualiza totais da comanda
      const novoTotal = Number(comandaSelecionada.total) + subtotal;
      const novoSubtotal = Number(comandaSelecionada.subtotal) + subtotal;
      await supabase.from('comandas').update({ subtotal: novoSubtotal, total: novoTotal }).eq('id', comandaSelecionada.id);

      setFormItem({ tipo: 'produto', id: '', quantidade: 1 });
      setComandaSelecionada({ ...comandaSelecionada, subtotal: novoSubtotal, total: novoTotal });
      carregarItens(comandaSelecionada.id);
      carregarComandas();
    } else {
      alert("Erro ao adicionar item: " + error.message);
    }
  }

  async function fecharComanda() {
    const desconto = Number(formPagamento.desconto) || 0;
    const totalFinal = Number(comandaSelecionada.subtotal) - desconto;
    if (totalFinal < 0) return alert("Desconto maior que o subtotal");

    const { data: tenantData } = await supabase.rpc('fn_tenant_id_atual');

    // 1. Atualizar comanda para paga
    const { error } = await supabase.from('comandas').update({
      status: 'paga',
      desconto,
      total: totalFinal,
      fechada_em: new Date().toISOString()
    }).eq('id', comandaSelecionada.id);

    if (error) return alert("Erro ao fechar comanda: " + error.message);

    // 2. Registrar pagamento
    const { error: errPag } = await supabase.from('pagamentos').insert([{
      tenant_id: tenantData,
      comanda_id: comandaSelecionada.id,
      valor: totalFinal,
      metodo: formPagamento.metodo,
      status: 'pago',
      pago_em: new Date().toISOString(),
      descricao: `Fechamento Comanda Cliente ${comandaSelecionada.usuarios?.nome}`
    }]);

    if (errPag) console.error("Aviso: Erro ao registrar pagamento no financeiro", errPag);

    setModalComandaDetalhe(false);
    setFormPagamento({ metodo: 'dinheiro', desconto: 0 });
    carregarComandas();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Comandas</div>
          <div className="page-sub">Controle de consumo em tempo real</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setModalNovaComanda(true)}>+ Nova Comanda</button>
        </div>
      </div>

      <div className="content" style={{ padding: 20 }}>
        {comandas.length === 0 && (
          <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <Receipt size={48} color="#B4AFA5" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>Nenhuma comanda aberta no momento</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>As comandas abertas aparecem aqui em tempo real.</div>
            <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={() => setModalAberto(true)}>+ Nova Comanda</button>
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {comandas.map(c => (
            <div key={c.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }} onClick={() => abrirDetalhe(c)} 
                 onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Badge tipo="blue">Aberta</Badge>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {new Date(c.aberta_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
                {c.usuarios?.nome || 'Cliente não identificado'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 16 }}>
                Comanda: #{c.id.split('-')[0]}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px' }}>Total</div>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>
                  R$ {Number(c.total).toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalNovaComanda && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalNovaComanda(false)}>
          <div className="modal" style={{width: 400}}>
            <div className="modal-title">Abrir Nova Comanda</div>
            
            <div className="form-group">
              <label className="form-label">Selecionar Cliente</label>
              <select className="form-select" value={novoClienteId} onChange={e => setNovoClienteId(e.target.value)}>
                <option value="">Selecione um cliente...</option>
                {clientes.map(cli => (
                  <option key={cli.id} value={cli.id}>{cli.nome}</option>
                ))}
              </select>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalNovaComanda(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={abrirComanda} disabled={!novoClienteId}>Abrir Comanda</button>
            </div>
          </div>
        </div>
      )}

      {modalComandaDetalhe && comandaSelecionada && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalComandaDetalhe(false)}>
          <div className="modal" style={{width: 600, maxHeight: '90vh', overflowY: 'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 20}}>
              <div>
                <div className="modal-title" style={{marginBottom: 4}}>Comanda de {comandaSelecionada.usuarios?.nome}</div>
                <div style={{fontSize: 12, color: 'var(--muted)'}}>Iniciada às {new Date(comandaSelecionada.aberta_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 600, marginBottom: 2}}>Total Atual</div>
                <div style={{fontSize: 24, fontWeight: 600, color: 'var(--gold)'}}>R$ {Number(comandaSelecionada.total).toFixed(2)}</div>
              </div>
            </div>

            <div style={{background: 'var(--surface)', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 20}}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Adicionar Item</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Tipo</label>
                  <select className="form-select" value={formItem.tipo} onChange={e => setFormItem({...formItem, tipo: e.target.value, id: ''})}>
                    <option value="produto">Produto (Estoque)</option>
                    <option value="servico">Serviço</option>
                  </select>
                </div>
                <div style={{ flex: 2 }}>
                  <label className="form-label">Item</label>
                  <select className="form-select" value={formItem.id} onChange={e => setFormItem({...formItem, id: e.target.value})}>
                    <option value="">Selecione...</option>
                    {formItem.tipo === 'produto' 
                      ? produtos.map(p => <option key={p.id} value={p.id}>{p.nome} - R${p.preco_venda} (Estoque: {p.quantidade_estoque})</option>)
                      : servicos.map(s => <option key={s.id} value={s.id}>{s.nome} - R${s.preco}</option>)
                    }
                  </select>
                </div>
                <div style={{ width: 80 }}>
                  <label className="form-label">Qtd</label>
                  <input className="form-input" type="number" min="1" value={formItem.quantidade} onChange={e => setFormItem({...formItem, quantidade: e.target.value})} />
                </div>
                <button className="btn btn-outline" style={{ height: 36, borderColor: 'var(--gold)', color: 'var(--amber)' }} onClick={adicionarItem} disabled={!formItem.id}>
                  Adicionar
                </button>
              </div>
            </div>

            <div style={{marginBottom: 20}}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Itens Consumidos</div>
              {itensComanda.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Nenhum item adicionado ainda.</div>
              ) : (
                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'var(--surface)', fontSize: 11, color: 'var(--muted)', textAlign: 'left' }}>
                      <tr>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Item</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>Qtd</th>
                        <th style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensComanda.map(item => (
                        <tr key={item.id}>
                          <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border)' }}>
                            {item.nome_item}
                            {item.produto_id && <Badge tipo="gray" style={{marginLeft: 6, fontSize: 9}}>Prod</Badge>}
                            {item.servico_id && <Badge tipo="blue" style={{marginLeft: 6, fontSize: 9}}>Serv</Badge>}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border)' }}>{item.quantidade}x</td>
                          <td style={{ padding: '10px 12px', fontSize: 13, borderBottom: '1px solid var(--border)', textAlign: 'right', fontWeight: 500 }}>
                            R$ {Number(item.subtotal).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div style={{ background: '#FAF9F6', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--green)' }}>Pagamento e Fechamento</div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Desconto (R$)</label>
                  <input className="form-input" type="number" placeholder="0.00" value={formPagamento.desconto} onChange={e => setFormPagamento({...formPagamento, desconto: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Método de Pagamento</label>
                  <select className="form-select" value={formPagamento.metodo} onChange={e => setFormPagamento({...formPagamento, metodo: e.target.value})}>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="credito">Cartão de Crédito</option>
                    <option value="debito">Cartão de Débito</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTop: '1px solid #E8E2D4' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Total a Pagar</span>
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--green)' }}>
                  R$ {Math.max(0, Number(comandaSelecionada.subtotal) - (Number(formPagamento.desconto) || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalComandaDetalhe(false)}>Voltar</button>
              <button className="btn btn-primary" style={{ background: 'var(--green)', color: '#fff' }} onClick={fecharComanda} disabled={itensComanda.length === 0}>
                Pagar e Fechar Comanda
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
