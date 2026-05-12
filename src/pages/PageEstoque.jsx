import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function Badge({ tipo, children }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>;
}

export default function PageEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [modalProduto, setModalProduto] = useState(false);
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  
  // Forms
  const [formProduto, setFormProduto] = useState({ nome: '', categoria: '', preco_custo: '', preco_venda: '', sku: '' });
  const [formMov, setFormMov] = useState({ tipo: 'entrada', quantidade: '', motivo: '' });

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data } = await supabase.from('produtos').select('*').order('nome');
    if (data) setProdutos(data);
  }

  async function salvarProduto() {
    const { data: tenantData } = await supabase.rpc('fn_tenant_id_atual');
    const { error } = await supabase.from('produtos').insert([{
      tenant_id: tenantData,
      nome: formProduto.nome,
      categoria: formProduto.categoria,
      preco_custo: Number(formProduto.preco_custo) || 0,
      preco_venda: Number(formProduto.preco_venda) || 0,
      sku: formProduto.sku || null,
      quantidade_estoque: 0
    }]);

    if (!error) {
      setModalProduto(false);
      setFormProduto({ nome: '', categoria: '', preco_custo: '', preco_venda: '', sku: '' });
      carregarProdutos();
    } else {
      alert("Erro ao salvar produto: " + error.message);
    }
  }

  async function salvarMovimentacao() {
    if (!produtoSelecionado) return;
    const qtd = Number(formMov.quantidade);
    if (qtd <= 0) return alert("Quantidade deve ser maior que zero.");

    const { data: tenantData } = await supabase.rpc('fn_tenant_id_atual');
    
    // Inserir movimentação
    const { error: errMov } = await supabase.from('estoque_movimentacoes').insert([{
      tenant_id: tenantData,
      produto_id: produtoSelecionado.id,
      tipo: formMov.tipo,
      quantidade: qtd,
      motivo: formMov.motivo || ''
    }]);

    if (errMov) return alert("Erro ao registrar movimentação.");

    // Atualizar quantidade no produto
    const novaQtd = formMov.tipo === 'entrada' 
      ? produtoSelecionado.quantidade_estoque + qtd 
      : produtoSelecionado.quantidade_estoque - qtd;

    const { error: errProd } = await supabase.from('produtos')
      .update({ quantidade_estoque: novaQtd })
      .eq('id', produtoSelecionado.id);

    if (!errProd) {
      setModalMovimentacao(false);
      setFormMov({ tipo: 'entrada', quantidade: '', motivo: '' });
      setProdutoSelecionado(null);
      carregarProdutos();
    } else {
      alert("Erro ao atualizar estoque.");
    }
  }

  function abrirMovimentacao(produto, tipo) {
    setProdutoSelecionado(produto);
    setFormMov({ ...formMov, tipo });
    setModalMovimentacao(true);
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Estoque de Produtos</div>
          <div className="page-sub">Gestão de itens e movimentações</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => setModalProduto(true)}>+ Novo Produto</button>
        </div>
      </div>

      <div className="content" style={{ padding: 20 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço Venda</th>
                <th>Estoque Atual</th>
                <th style={{textAlign: 'right'}}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    Nenhum produto cadastrado no estoque.
                  </td>
                </tr>
              )}
              {produtos.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="bold">{p.nome}</span>
                    {p.sku && <div style={{fontSize: 10, color: 'var(--muted)', marginTop: 2}}>SKU: {p.sku}</div>}
                  </td>
                  <td><Badge tipo="gray">{p.categoria || 'Sem categoria'}</Badge></td>
                  <td>R$ {Number(p.preco_venda).toFixed(2)}</td>
                  <td>
                    <Badge tipo={p.quantidade_estoque > 5 ? 'green' : p.quantidade_estoque > 0 ? 'amber' : 'red'}>
                      {p.quantidade_estoque} unid.
                    </Badge>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn btn-outline" style={{padding: '5px 10px', fontSize: 11, marginRight: 6}} 
                      onClick={() => abrirMovimentacao(p, 'entrada')}>Entrada</button>
                    <button className="btn btn-outline" style={{padding: '5px 10px', fontSize: 11, borderColor: '#F09595', color: 'var(--red)'}} 
                      onClick={() => abrirMovimentacao(p, 'saida')}>Saída</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalProduto && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalProduto(false)}>
          <div className="modal" style={{width: 460}}>
            <div className="modal-title">Novo Produto</div>
            
            <div className="form-group">
              <label className="form-label">Nome do Produto *</label>
              <input className="form-input" placeholder="Ex: Pomada Matte" value={formProduto.nome} onChange={e => setFormProduto({...formProduto, nome: e.target.value})} />
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <input className="form-input" placeholder="Ex: Cabelo" value={formProduto.categoria} onChange={e => setFormProduto({...formProduto, categoria: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">SKU (Código)</label>
                <input className="form-input" placeholder="Ex: POM-001" value={formProduto.sku} onChange={e => setFormProduto({...formProduto, sku: e.target.value})} />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Preço de Custo (R$)</label>
                <input className="form-input" type="number" placeholder="0.00" value={formProduto.preco_custo} onChange={e => setFormProduto({...formProduto, preco_custo: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Preço de Venda (R$)</label>
                <input className="form-input" type="number" placeholder="0.00" value={formProduto.preco_venda} onChange={e => setFormProduto({...formProduto, preco_venda: e.target.value})} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalProduto(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarProduto} disabled={!formProduto.nome}>Salvar Produto</button>
            </div>
          </div>
        </div>
      )}

      {modalMovimentacao && produtoSelecionado && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setModalMovimentacao(false)}>
          <div className="modal" style={{width: 400}}>
            <div className="modal-title">Movimentar Estoque</div>
            <div style={{marginBottom: 16, fontSize: 13, color: 'var(--muted)'}}>
              Produto: <strong style={{color: 'var(--text)'}}>{produtoSelecionado.nome}</strong> (Atual: {produtoSelecionado.quantidade_estoque})
            </div>
            
            <div className="form-group">
              <label className="form-label">Tipo de Movimentação</label>
              <select className="form-select" value={formMov.tipo} onChange={e => setFormMov({...formMov, tipo: e.target.value})}>
                <option value="entrada">Entrada (+)</option>
                <option value="saida">Saída / Baixa (-)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantidade</label>
              <input className="form-input" type="number" min="1" placeholder="Ex: 5" value={formMov.quantidade} onChange={e => setFormMov({...formMov, quantidade: e.target.value})} />
            </div>

            <div className="form-group">
              <label className="form-label">Motivo / Observação</label>
              <input className="form-input" placeholder="Ex: Compra de fornecedor, Uso interno..." value={formMov.motivo} onChange={e => setFormMov({...formMov, motivo: e.target.value})} />
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModalMovimentacao(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarMovimentacao} disabled={!formMov.quantidade}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
