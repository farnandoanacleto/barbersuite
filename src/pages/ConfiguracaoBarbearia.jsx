import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .cfg * { box-sizing: border-box; margin: 0; padding: 0; }
  .cfg {
    font-family: 'DM Sans', sans-serif;
    --gold: #B8973A; --gold-l: #D4AF5A; --gold-p: #FAF0D4;
    --dark: #1A1610; --surf: #FAFAF8; --white: #FFFFFF;
    --muted: #7A7060; --faint: #B4AFA5; --bord: #E8E2D4;
    --green: #2D6E3E; --green-b: #EAF4ED;
    --red: #A32D2D; --red-b: #FCEBEB;
    --amb: #854F0B; --amb-b: #FAEEDA;
    --blue: #185FA5; --blue-b: #E6F1FB;
    color: var(--dark); font-size: 14px; line-height: 1.5;
    background: var(--surf); min-height: 100%;
  }

  /* Layout */
  .cfg-layout { display: flex; height: 100vh; }
  .cfg-sidebar {
    width: 220px; min-width: 220px; background: var(--dark);
    display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh;
  }
  .cfg-logo { padding: 20px 18px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .cfg-logo-name { font-family: 'Playfair Display', serif; color: var(--gold); font-size: 14px; font-weight: 600; }
  .cfg-logo-sub { font-size: 9px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }
  .cfg-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .cfg-nav-section { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.2); padding: 8px 18px 4px; }
  .cfg-nav-item { display: flex; align-items: center; padding: 9px 18px; cursor: pointer; font-size: 12px; color: rgba(255,255,255,0.5); border-left: 2px solid transparent; transition: all 0.15s; }
  .cfg-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }
  .cfg-nav-item.active { color: var(--gold-l); border-left-color: var(--gold); background: rgba(184,151,58,0.1); }
  .cfg-nav-icon { display: none; }
  .cfg-user { padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; align-items: center; gap: 9px; }
  .cfg-user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; color: var(--dark); flex-shrink: 0; }
  .cfg-user-name { font-size: 11px; color: rgba(255,255,255,0.7); font-weight: 500; }
  .cfg-user-role { font-size: 9px; color: rgba(255,255,255,0.3); }

  .cfg-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .cfg-topbar { background: var(--white); border-bottom: 1px solid var(--bord); padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; }
  .cfg-page-title { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 600; }
  .cfg-page-sub { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .cfg-content { flex: 1; overflow-y: auto; padding: 22px 24px; height: 100%; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .btn-primary { background: var(--gold); color: var(--dark); }
  .btn-primary:hover { background: var(--gold-l); }
  .btn-outline { background: transparent; border: 1px solid var(--bord); color: var(--dark); }
  .btn-outline:hover { background: var(--surf); }
  .btn-danger { background: var(--red-b); color: var(--red); border: 1px solid #F09595; }
  .btn-green { background: var(--green-b); color: var(--green); border: 1px solid #97C459; }
  .btn-row { display: flex; gap: 8px; align-items: center; }

  /* Cards */
  .card { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; margin-bottom: 14px; overflow: hidden; }
  .card-header { padding: 14px 18px; border-bottom: 1px solid var(--bord); display: flex; align-items: center; justify-content: space-between; background: var(--surf); }
  .card-title { font-size: 13px; font-weight: 600; color: var(--dark); }
  .card-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .card-body { padding: 18px; }

  /* Form */
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px; }
  .form-input, .form-select, .form-textarea {
    width: 100%; padding: 9px 12px; border: 1px solid var(--bord);
    border-radius: 7px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--dark); background: var(--white); outline: none; transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--gold); }
  .form-textarea { resize: vertical; min-height: 80px; }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .form-row { display: flex; gap: 10px; align-items: flex-end; }
  .form-row .form-group { flex: 1; margin-bottom: 0; }

  /* Table */
  .tbl-wrap { border: 1px solid var(--bord); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: var(--surf); padding: 9px 14px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--bord); }
  tbody td { padding: 11px 14px; border-bottom: 1px solid var(--bord); font-size: 13px; vertical-align: middle; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #FAF9F6; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-green { background: var(--green-b); color: var(--green); }
  .badge-gray  { background: #F1EFE8; color: #5F5E5A; }
  .badge-gold  { background: var(--gold-p); color: var(--amb); }
  .badge-red   { background: var(--red-b); color: var(--red); }
  .badge-blue  { background: var(--blue-b); color: var(--blue); }

  /* Toggle switch */
  .toggle-wrap { display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .toggle { width: 36px; height: 20px; border-radius: 10px; background: var(--bord); position: relative; transition: background 0.2s; flex-shrink: 0; }
  .toggle.on { background: var(--green); }
  .toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--white); transition: transform 0.2s; }
  .toggle.on::after { transform: translateX(16px); }
  .toggle-label { font-size: 12px; color: var(--dark); }

  /* Modal */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(26,22,16,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .modal { background: var(--white); border-radius: 14px; padding: 28px; width: 680px; max-width: 96vw; max-height: 90vh; overflow-y: auto; animation: mIn 0.18s ease; }
  @keyframes mIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; margin-bottom: 18px; }
  .modal-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }

  /* Stats */
  .stat-grid { display: grid; gap: 12px; margin-bottom: 20px; }
  .stat-grid-4 { grid-template-columns: repeat(4,1fr); }
  .stat-grid-3 { grid-template-columns: repeat(3,1fr); }
  .stat-card { background: var(--white); border: 1px solid var(--bord); border-radius: 10px; padding: 14px 16px; }
  .stat-label { font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; margin-top: 4px; }
  .stat-sub { font-size: 11px; color: var(--muted); margin-top: 4px; }

  /* Cor picker */
  .cor-grid { display: flex; gap: 8px; flex-wrap: wrap; }
  .cor-btn { width: 32px; height: 32px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: all 0.15s; }
  .cor-btn.sel { border-color: var(--dark); }

  /* Misc */
  .divider { height: 1px; background: var(--bord); margin: 16px 0; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; margin-bottom: 14px; }
  .text-muted { color: var(--muted); }
  .text-small { font-size: 11px; }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-gold { color: var(--gold); }
  .bold { font-weight: 600; }
  .mt-4 { margin-top: 4px; }
  .mb-16 { margin-bottom: 16px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; }
  .alert-box { border-radius: 8px; padding: 11px 14px; font-size: 12px; margin-bottom: 14px; display: flex; gap: 10px; align-items: flex-start; }
  .alert-ok { background: var(--green-b); color: var(--green); border: 1px solid #97C459; }
  .alert-info { background: var(--blue-b); color: var(--blue); border: 1px solid #85B7EB; }

  /* Drag handle */
  .drag-handle { cursor: grab; color: var(--faint); font-size: 16px; padding: 0 8px; }
  .categoria-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .cat-corte    { background: #E6F1FB; color: #185FA5; }
  .cat-barba    { background: #EEEDFE; color: #3C3489; }
  .cat-skincare { background: #EAF4ED; color: #2D6E3E; }
  .cat-combo    { background: #FAF0D4; color: #854F0B; }
  .cat-outro    { background: #F1EFE8; color: #5F5E5A; }
`;

// ─── DADOS MOCK ───────────────────────────────────────────────────────────────
const CATEGORIAS = ['corte','barba','skincare','combo','outro'];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const R = (v) => `R$${Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2})}`;
const catClass = (c) => `categoria-pill cat-${c}`;
const catLabel = (c) => ({ corte:'Corte', barba:'Barba', skincare:'Skincare', combo:'Combo', outro:'Outro' })[c] || c;

// ─── MODAL SERVIÇO ────────────────────────────────────────────────────────────
function ModalServico({ servico, onSave, onClose }) {
  const isNovo = !servico?.id;
  const [form, setForm] = useState(servico || { nome:'', categoria:'corte', duracao:45, preco:0, ativo:true });
  const set = (k,v) => setForm(f => ({...f,[k]:v}));

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">{isNovo ? 'Novo serviço' : 'Editar serviço'}</div>

        <div className="form-group">
          <label className="form-label">Nome do serviço</label>
          <input className="form-input" value={form.nome} onChange={e=>set('nome',e.target.value)} placeholder="Ex: Corte degradê" />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Categoria</label>
            <select className="form-select" value={form.categoria} onChange={e=>set('categoria',e.target.value)}>
              {CATEGORIAS.map(c=><option key={c} value={c}>{catLabel(c)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Duração (minutos)</label>
            <input className="form-input" type="number" value={form.duracao} onChange={e=>set('duracao',Number(e.target.value))} min={5} step={5} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preço (R$)</label>
          <input className="form-input" type="number" value={form.preco} onChange={e=>set('preco',Number(e.target.value))} min={0} step={5} />
        </div>

        <div className="toggle-wrap" onClick={()=>set('ativo',!form.ativo)}>
          <div className={`toggle ${form.ativo?'on':''}`} />
          <span className="toggle-label">{form.ativo ? 'Serviço ativo (visível para clientes)' : 'Serviço inativo (oculto)'}</span>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave(form)} disabled={!form.nome}>
            {isNovo ? 'Criar serviço' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL PLANO ──────────────────────────────────────────────────────────────
function ModalPlano({ plano, onSave, onClose }) {
  const isNovo = !plano?.id;
  const [form, setForm] = useState({ nome:'', preco:0, visitas:4, ilimitado:false, servicos:[], destaque:false, ativo:true, ...plano });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const toggleSvc = (s) => set('servicos', form.servicos.includes(s) ? form.servicos.filter(x=>x!==s) : [...form.servicos,s]);

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">{isNovo ? 'Novo plano' : 'Editar plano'}</div>

        <div className="form-group">
          <label className="form-label">Nome do plano</label>
          <input className="form-input" value={form.nome} onChange={e=>set('nome',e.target.value)} placeholder="Ex: Clube VIP" />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Preço mensal (R$)</label>
            <input className="form-input" type="number" value={form.preco} onChange={e=>set('preco',Number(e.target.value))} min={0} />
          </div>
          <div className="form-group">
            <label className="form-label">Visitas por mês</label>
            <input className="form-input" type="number" value={form.ilimitado ? '' : form.visitas} onChange={e=>set('visitas',Number(e.target.value))} disabled={form.ilimitado} placeholder={form.ilimitado?'Ilimitado':''} />
          </div>
        </div>

        <div style={{display:'flex',gap:16,marginBottom:14}}>
          <div className="toggle-wrap" onClick={()=>set('ilimitado',!form.ilimitado)}>
            <div className={`toggle ${form.ilimitado?'on':''}`} />
            <span className="toggle-label">Visitas ilimitadas</span>
          </div>
          <div className="toggle-wrap" onClick={()=>set('destaque',!form.destaque)}>
            <div className={`toggle ${form.destaque?'on':''}`} />
            <span className="toggle-label">Plano destaque</span>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Serviços incluídos</label>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:6}}>
            {CATEGORIAS.filter(c=>c!=='outro').map(c=>(
              <div key={c} className="toggle-wrap" onClick={()=>toggleSvc(c)}>
                <div className={`toggle ${form.servicos.includes(c)?'on':''}`} style={{width:28,height:16}} />
                <span className="toggle-label">{catLabel(c)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="toggle-wrap" onClick={()=>set('ativo',!form.ativo)}>
          <div className={`toggle ${form.ativo?'on':''}`} />
          <span className="toggle-label">{form.ativo ? 'Plano ativo' : 'Plano inativo'}</span>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={()=>onSave(form)} disabled={!form.nome}>
            {isNovo ? 'Criar plano' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ABA SERVIÇOS ─────────────────────────────────────────────────────────────
function TabServicos() {
  const [servicos, setServicos] = useState([]);
  const [editandoServico, setEditandoServico] = useState(null);
  const [novoServico, setNovoServico] = useState({ nome:'', descricao:'', duracao_min:30, preco:'', categoria:'corte' });
  const [mostrarFormServico, setMostrarFormServico] = useState(false);

  useEffect(() => {
    supabase.from('servicos').select('*').order('nome')
      .then(({ data }) => { if (data) setServicos(data); });
  }, []);

  async function salvarServico(form) {
    if (form.id) {
      const { error } = await supabase.from('servicos').update({
        nome: form.nome,
        descricao: form.descricao || '',
        duracao_min: parseInt(form.duracao_min) || 30,
        preco: parseFloat(form.preco) || 0,
        categoria: form.categoria || 'corte',
      }).eq('id', form.id);
      if (error) { alert('Erro ao atualizar: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('servicos').insert({
        nome: form.nome,
        descricao: form.descricao || '',
        duracao_min: parseInt(form.duracao_min) || 30,
        preco: parseFloat(form.preco) || 0,
        categoria: form.categoria || 'corte',
        ativo: true,
      });
      if (error) { alert('Erro ao criar: ' + error.message); return; }
    }
    const { data } = await supabase.from('servicos').select('*').order('nome');
    if (data) setServicos(data);
    setEditandoServico(null);
    setMostrarFormServico(false);
    setNovoServico({ nome:'', descricao:'', duracao_min:30, preco:'', categoria:'corte' });
  }

  async function toggleServico(id, ativo) {
    await supabase.from('servicos').update({ ativo: !ativo }).eq('id', id);
    setServicos(prev => prev.map(s => s.id === id ? {...s, ativo: !ativo} : s));
  }

  return (
    <div style={{marginTop:32}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:600}}>Servicos</div>
        <button style={{background:'#B8973A',color:'#1A1610',border:'none',padding:'8px 16px',borderRadius:6,fontSize:12,fontWeight:600,cursor:'pointer'}}
          onClick={()=>{ setNovoServico({nome:'',descricao:'',duracao_min:30,preco:'',categoria:'corte'}); setEditandoServico(null); setMostrarFormServico(true); }}>
          + Novo servico
        </button>
      </div>

      {mostrarFormServico && (
        <div style={{background:'#FAF9F6',border:'1px solid #E8E2D4',borderRadius:10,padding:20,marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Nome</label>
              <input style={{width:'100%',padding:'8px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none'}}
                value={editandoServico?.nome||novoServico.nome}
                onChange={e=>editandoServico?setEditandoServico({...editandoServico,nome:e.target.value}):setNovoServico({...novoServico,nome:e.target.value})} />
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Categoria</label>
              <select style={{width:'100%',padding:'8px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none',background:'#fff'}}
                value={editandoServico?.categoria||novoServico.categoria}
                onChange={e=>editandoServico?setEditandoServico({...editandoServico,categoria:e.target.value}):setNovoServico({...novoServico,categoria:e.target.value})}>
                <option value="corte">Corte</option>
                <option value="barba">Barba</option>
                <option value="combo">Combo</option>
                <option value="extra">Servico Extra</option>
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Preco (R$)</label>
              <input style={{width:'100%',padding:'8px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none'}}
                type="number" value={editandoServico?.preco||novoServico.preco}
                onChange={e=>editandoServico?setEditandoServico({...editandoServico,preco:e.target.value}):setNovoServico({...novoServico,preco:e.target.value})} />
            </div>
            <div>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Duracao (min)</label>
              <input style={{width:'100%',padding:'8px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none'}}
                type="number" value={editandoServico?.duracao_min||novoServico.duracao_min}
                onChange={e=>editandoServico?setEditandoServico({...editandoServico,duracao_min:e.target.value}):setNovoServico({...novoServico,duracao_min:e.target.value})} />
            </div>
          </div>
          <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
            <button style={{padding:'8px 16px',borderRadius:6,border:'1px solid #E8E2D4',background:'transparent',fontSize:12,cursor:'pointer'}}
              onClick={()=>{ setMostrarFormServico(false); setEditandoServico(null); }}>Cancelar</button>
            <button style={{padding:'8px 16px',borderRadius:6,background:'#B8973A',border:'none',fontSize:12,fontWeight:600,cursor:'pointer',color:'#1A1610'}}
              onClick={()=>salvarServico(editandoServico||novoServico)}>Salvar</button>
          </div>
        </div>
      )}

      <div style={{background:'#fff',border:'1px solid #E8E2D4',borderRadius:10,overflow:'hidden'}}>
        {servicos.map((s,i)=>(
          <div key={s.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderBottom:i<servicos.length-1?'1px solid #E8E2D4':'none'}}>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color: s.ativo?'#1A1610':'#B4AFA5'}}>{s.nome}</div>
              <div style={{fontSize:11,color:'#7A7060',marginTop:2}}>{s.categoria} · {s.duracao_min}min · R${Number(s.preco).toFixed(0)}</div>
            </div>
            <button style={{padding:'5px 10px',borderRadius:5,border:'1px solid #E8E2D4',background:'transparent',fontSize:11,cursor:'pointer'}}
              onClick={()=>{ setEditandoServico({...s}); setMostrarFormServico(true); }}>Editar</button>
            <button style={{padding:'5px 10px',borderRadius:5,border:'none',background:s.ativo?'#EAF4ED':'#FCEBEB',fontSize:11,cursor:'pointer',color:s.ativo?'#2D6E3E':'#A32D2D'}}
              onClick={()=>toggleServico(s.id, s.ativo)}>{s.ativo?'Ativo':'Inativo'}</button>
          </div>
        ))}
        {servicos.length===0&&(
          <div style={{padding:24,textAlign:'center',color:'#7A7060',fontSize:13}}>Nenhum servico cadastrado ainda.</div>
        )}
      </div>
    </div>
  );
}

// ─── ABA PLANOS DO CLUBE ──────────────────────────────────────────────────────
function TabPlanos({ planos, setPlanos }) {
  const [modal, setModal] = useState(null);
  const [salvo, setSalvo] = useState(false);

  const salvar = async (form) => {
    const payload = {
      nome: form.nome,
      preco: parseFloat(form.preco) || 0,
      visitas_mes: form.ilimitado ? null : parseInt(form.visitas) || null,
      visitas_ilimitadas: form.ilimitado || false,
      servicos_incluidos: form.servicos || [],
      featured: form.destaque || false,
      ativo: form.ativo !== undefined ? form.ativo : true,
    };

    let error;
    if (form.id && form.id <= 1000) {
      const res = await supabase.from('planos').update(payload).eq('id', form.id);
      error = res.error;
    } else {
      const res = await supabase.from('planos').insert(payload);
      error = res.error;
    }

    if (error) {
      console.error('Erro ao salvar plano:', error);
      alert('Erro ao salvar plano: ' + error.message);
      return;
    }

    const { data: novosPlanos } = await supabase.from('planos').select('*').order('preco');
    if (novosPlanos) {
      setPlanos((novosPlanos || []).map(p => ({
        ...p,
        servicos: p.servicos_incluidos || [],
        visitas: p.visitas_mes || 0,
        ilimitado: p.visitas_ilimitadas || false,
        destaque: p.featured || false,
      })));
    }
    setModal(null);
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2500);
  };

  const excluir = (id) => setPlanos(p=>p.filter(x=>x.id!==id));
  const toggleAtivo = (id) => setPlanos(p=>p.map(x=>x.id===id?{...x,ativo:!x.ativo}:x));

  const totalMRR = planos.filter(p=>p.ativo).reduce((a,p)=>a+p.preco,0);

  return (
    <>
      {salvo && <div className="alert-box alert-ok">✓ Plano salvo! Já disponível para novos assinantes.</div>}

      <div className="stat-grid stat-grid-3 mb-16" style={{marginBottom:16}}>
        <div className="stat-card">
          <div className="stat-label">Planos ativos</div>
          <div className="stat-value">{planos.filter(p=>p.ativo).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ticket médio</div>
          <div className="stat-value text-gold">
            {planos.length ? R(planos.reduce((a,p)=>a+p.preco,0)/planos.length) : 'R$0'}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Faixa de preços</div>
          <div className="stat-value" style={{fontSize:16,marginTop:8}}>
            {R(Math.min(...planos.map(p=>p.preco)))} — {R(Math.max(...planos.map(p=>p.preco)))}
          </div>
        </div>
      </div>

      <div className="row-between mb-16">
        <div className="section-title" style={{marginBottom:0}}>Seus planos</div>
        <button className="btn btn-primary" onClick={()=>setModal({})}>+ Novo plano</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,marginBottom:16}}>
        {planos.map(p=>(
          <div key={p.id} className="card" style={{marginBottom:0,border:p.destaque?'2px solid var(--gold)':''}}>
            {p.destaque && <div style={{background:'var(--gold)',color:'var(--dark)',fontSize:9,fontWeight:700,textTransform:'uppercase',letterSpacing:1,padding:'4px 12px',textAlign:'center'}}>★ Destaque</div>}
            <div className="card-body">
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600,marginBottom:4}}>{p.nome}</div>
              <div style={{fontSize:26,fontWeight:300,color:'var(--gold)',marginBottom:4}}>
                R${p.preco}<span style={{fontSize:11,color:'var(--muted)'}}>/mês</span>
              </div>
              <div className="text-small text-muted" style={{marginBottom:10}}>
                {p.ilimitado ? 'Visitas ilimitadas' : `${p.visitas} visitas/mês`}
              </div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:12}}>
                {p.servicos.map(s=><span key={s} className={catClass(s)}>{catLabel(s)}</span>)}
              </div>
              <div style={{display:'flex',gap:6}}>
                <button className="btn btn-outline" style={{flex:1,fontSize:11,padding:'5px'}} onClick={()=>setModal(p)}>Editar</button>
                <div className="toggle-wrap" onClick={()=>toggleAtivo(p.id)} style={{marginLeft:'auto'}}>
                  <div className={`toggle ${p.ativo?'on':''}`} style={{width:28,height:16}}/>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="alert-box alert-info">
        ℹ Planos ativos aparecem na página de assinatura do cliente. O plano com "Destaque" aparece em evidência com borda dourada.
      </div>

      {modal !== null && <ModalPlano plano={modal} onSave={salvar} onClose={()=>setModal(null)} />}
    </>
  );
}

// ─── ABA PERFIL ───────────────────────────────────────────────────────────────
const CORES = ['#B8973A','#1A1610','#2D6E3E','#185FA5','#A32D2D','#7A7060','#854F0B','#3C3489'];
const DIAS_SEMANA = [{k:'seg',l:'Seg'},{k:'ter',l:'Ter'},{k:'qua',l:'Qua'},{k:'qui',l:'Qui'},{k:'sex',l:'Sex'},{k:'sab',l:'Sáb'},{k:'dom',l:'Dom'}];

function TabPerfil({ perfil, setPerfil }) {
  const [salvo, setSalvo] = useState(false);
  const set = (k,v) => setPerfil(p=>({...p,[k]:v}));

  const toggleDia = (d) => set('dias_funcionamento',
    perfil.dias_funcionamento.includes(d)
      ? perfil.dias_funcionamento.filter(x=>x!==d)
      : [...perfil.dias_funcionamento,d]
  );

   const salvar = async () => {
     const { error } = await supabase
       .from('barbearia_perfis')
       .update({
         nome:               perfil.nome,
         slug:               perfil.slug,
         telefone:           perfil.telefone,
         email:              perfil.email,
         endereco:           perfil.endereco,
         descricao:          perfil.descricao,
         cor_principal:      perfil.cor_principal,
         horario_abertura:   perfil.horario_abertura,
         horario_fechamento: perfil.horario_fechamento,
         dias_funcionamento: perfil.dias_funcionamento,
         atualizado_em:      new Date().toISOString(),
       })
       .eq('slug', perfil.slug);

     if (error) {
       console.error('Erro ao salvar perfil:', error);
       alert('Erro ao salvar perfil. Tente novamente.');
     } else {
       setSalvo(true);
       setTimeout(() => setSalvo(false), 2500);
     }
   };

  return (
    <>
      {salvo && <div className="alert-box alert-ok">✓ Perfil salvo! As informações já aparecem no app do cliente.</div>}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Informações da barbearia</div>
            <div className="card-sub">Dados exibidos no app do cliente</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nome da barbearia</label>
              <input className="form-input" value={perfil.nome} onChange={e=>set('nome',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Slug (URL única)</label>
              <input className="form-input" value={perfil.slug} onChange={e=>set('slug',e.target.value.toLowerCase().replace(/\s/g,'-'))} />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Telefone / WhatsApp</label>
              <input className="form-input" value={perfil.telefone} onChange={e=>set('telefone',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" value={perfil.email} onChange={e=>set('email',e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input className="form-input" value={perfil.endereco} onChange={e=>set('endereco',e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Descrição</label>
            <textarea className="form-textarea" value={perfil.descricao} onChange={e=>set('descricao',e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Horário de funcionamento</div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Dias da semana</label>
            <div style={{display:'flex',gap:8,marginTop:6}}>
              {DIAS_SEMANA.map(d=>(
                <button key={d.k}
                  className={`btn ${perfil.dias_funcionamento.includes(d.k)?'btn-primary':'btn-outline'}`}
                  style={{padding:'6px 10px',fontSize:12}}
                  onClick={()=>toggleDia(d.k)}>
                  {d.l}
                </button>
              ))}
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Abertura</label>
              <input className="form-input" type="time" value={perfil.horario_abertura} onChange={e=>set('horario_abertura',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Fechamento</label>
              <input className="form-input" type="time" value={perfil.horario_fechamento} onChange={e=>set('horario_fechamento',e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Identidade visual</div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Cor principal</label>
            <div className="cor-grid mt-4">
              {CORES.map(c=>(
                <div key={c} className={`cor-btn ${perfil.cor_principal===c?'sel':''}`}
                  style={{background:c}} onClick={()=>set('cor_principal',c)} />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Preview da cor</label>
            <div style={{background:perfil.cor_principal,borderRadius:10,padding:'12px 16px',color:'#fff',fontSize:13,fontWeight:600}}>
              {perfil.nome} — Cor principal selecionada
            </div>
          </div>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'flex-end'}}>
        <button className="btn btn-primary" style={{padding:'10px 24px'}} onClick={salvar}>
          Salvar perfil
        </button>
      </div>
      <p style={{fontSize:11,color:'#7A7060',marginTop:8,textAlign:'right'}}>
        Horário salvo: {perfil.horario_abertura} às {perfil.horario_fechamento}
      </p>
    </>
  );
}

// ─── ABA EQUIPE ───────────────────────────────────────────────────────────────
const initEquipe = [
  { id:1, nome:'Rafael M.', email:'rafael@grancavalheiro.com', papel:'barbeiro', comissao:40, ativo:true  },
  { id:2, nome:'Thiago S.', email:'thiago@grancavalheiro.com', papel:'barbeiro', comissao:38, ativo:true  },
  { id:3, nome:'Bruno K.',  email:'bruno@grancavalheiro.com',  papel:'barbeiro', comissao:40, ativo:true  },
  { id:4, nome:'Lucas P.',  email:'lucas@grancavalheiro.com',  papel:'barbeiro', comissao:38, ativo:true  },
  { id:5, nome:'Gerente',   email:'admin@grancavalheiro.com',  papel:'admin',    comissao:0,  ativo:true  },
];

// ─── ABA BILLING (SAAS) ──────────────────────────────────────────────────────
function TabBilling({ perfil }) {
  const [stats, setStats] = useState({ clientes: 0, agendamentos: 0, equipe: 0 });
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [msgSucesso, setMsgSucesso] = useState(false);

  useEffect(() => {
    // Detecta retorno do Stripe Checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'sucesso') {
      setMsgSucesso(true);
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(() => setMsgSucesso(false), 6000);
    }
  }, []);

  useEffect(() => {
    if (!perfil.tenant_id) return;
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('papel', 'cliente').eq('tenant_id', perfil.tenant_id)
      .then(({ count }) => setStats(s => ({ ...s, clientes: count || 0 })));
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('papel', 'barbeiro').eq('tenant_id', perfil.tenant_id)
      .then(({ count }) => setStats(s => ({ ...s, equipe: count || 0 })));
    const inicioMes = new Date(); inicioMes.setDate(1); inicioMes.setHours(0,0,0,0);
    supabase.from('agendamentos').select('*', { count: 'exact', head: true }).eq('tenant_id', perfil.tenant_id).gte('data_hora', inicioMes.toISOString())
      .then(({ count }) => setStats(s => ({ ...s, agendamentos: count || 0 })));
  }, [perfil.tenant_id]);

  async function handleCheckout(planoKey) {
    setCheckoutLoading(planoKey);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plano: planoKey }),
        }
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }
    } catch (err) {
      alert('Erro ao iniciar checkout: ' + err.message);
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao abrir portal');
      }
    } catch (err) {
      alert('Erro ao abrir gerenciamento: ' + err.message);
    } finally {
      setPortalLoading(false);
    }
  }

  const planoAtual = perfil.plano_saas || null;
  const limiteClientes = planoAtual === 'starter' ? 200 : null;

  const planosSaaS = [
    { key: 'starter',    nome: 'Starter',    preco: '49',  desc: 'Ideal para quem está começando',   features: ['Até 200 clientes', 'Agenda completa', 'CRM básico'] },
    { key: 'pro',        nome: 'Pro',        preco: '99',  desc: 'Para barbearias em crescimento',   features: ['Clientes ilimitados', 'Módulo Financeiro', 'NPS e Fidelidade', 'Automação WhatsApp'], destaque: true },
    { key: 'enterprise', nome: 'Enterprise', preco: '199', desc: 'Gestão total para grandes redes',  features: ['Múltiplas unidades', 'Relatórios avançados', 'Suporte prioritário', 'API aberta'] },
  ];

  return (
    <>
      {msgSucesso && (
        <div className="alert-box alert-ok" style={{marginBottom:16}}>
          ✓ Assinatura ativada com sucesso! Seu plano já está ativo.
        </div>
      )}

      {/* Plano atual */}
      <div className="card" style={{background:'var(--dark)', color:'#fff', border:'none'}}>
        <div className="card-body" style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'24px'}}>
          <div>
            <div style={{fontSize:11, textTransform:'uppercase', letterSpacing:1, color:'rgba(255,255,255,0.4)', marginBottom:6}}>Plano Atual</div>
            <div style={{fontSize:22, fontWeight:700, fontFamily:"'Playfair Display',serif", color:'var(--gold)'}}>
              {planoAtual ? `BarberFlow ${planoAtual.toUpperCase()}` : 'Sem plano ativo'}
            </div>
            <div style={{fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4}}>
              {planoAtual ? 'Renovação mensal automática via Stripe' : 'Escolha um plano abaixo para começar'}
            </div>
          </div>
          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10}}>
            {planoAtual
              ? <div className="badge badge-gold" style={{padding:'6px 14px', fontSize:11}}>ATIVO</div>
              : <div className="badge badge-gray" style={{padding:'6px 14px', fontSize:11}}>SEM PLANO</div>
            }
            {perfil.stripe_customer_id && (
              <button
                className="btn btn-outline"
                style={{fontSize:11, color:'rgba(255,255,255,0.6)', borderColor:'rgba(255,255,255,0.2)'}}
                onClick={handlePortal}
                disabled={portalLoading}
              >
                {portalLoading ? 'Abrindo...' : 'Gerenciar assinatura'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="section-title" style={{marginTop:24, marginBottom:16}}>Uso da plataforma</div>
      <div className="stat-grid stat-grid-3 mb-16">
        <div className="card" style={{marginBottom:0}}>
          <div className="card-body">
            <div className="form-label">Clientes</div>
            <div style={{fontSize:20, fontWeight:700}}>
              {stats.clientes}{limiteClientes ? ` / ${limiteClientes}` : ''}
            </div>
            {limiteClientes && (
              <div style={{width:'100%', height:4, background:'#eee', borderRadius:2, marginTop:8}}>
                <div style={{width:`${Math.min((stats.clientes/limiteClientes)*100,100)}%`, height:'100%', background:'var(--gold)', borderRadius:2}} />
              </div>
            )}
          </div>
        </div>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-body">
            <div className="form-label">Agendamentos no mês</div>
            <div style={{fontSize:20, fontWeight:700}}>{stats.agendamentos}</div>
          </div>
        </div>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-body">
            <div className="form-label">Membros da equipe</div>
            <div style={{fontSize:20, fontWeight:700}}>{stats.equipe}</div>
          </div>
        </div>
      </div>

      <div className="section-title" style={{marginTop:24, marginBottom:16}}>Planos disponíveis</div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16}}>
        {planosSaaS.map(p => (
          <div key={p.key} className="card" style={{
            marginBottom:0, display:'flex', flexDirection:'column',
            border: p.destaque ? '2px solid var(--gold)' : (planoAtual === p.key ? '2px solid var(--dark)' : '1px solid var(--bord)')
          }}>
            {p.destaque && <div style={{background:'var(--gold)', color:'var(--dark)', fontSize:10, fontWeight:700, textAlign:'center', padding:'4px', textTransform:'uppercase'}}>Recomendado</div>}
            <div className="card-body" style={{flex:1}}>
              <div style={{fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, marginBottom:8}}>{p.nome}</div>
              <div style={{fontSize:12, color:'var(--muted)', marginBottom:16, height:36}}>{p.desc}</div>
              <div style={{fontSize:32, fontWeight:700, marginBottom:20}}>
                <span style={{fontSize:16, fontWeight:400, verticalAlign:'middle', marginRight:2}}>R$</span>
                {p.preco}
                <span style={{fontSize:13, fontWeight:400, color:'var(--muted)'}}>/mês</span>
              </div>
              <div style={{marginBottom:24}}>
                {p.features.map(f => (
                  <div key={f} style={{display:'flex', gap:8, fontSize:12, marginBottom:8, alignItems:'center'}}>
                    <span style={{color:'var(--gold)'}}>✓</span> {f}
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:16, borderTop:'1px solid var(--bord)'}}>
              {planoAtual === p.key ? (
                <button className="btn btn-outline" style={{width:'100%', justifyContent:'center'}} disabled>
                  Plano Atual
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{width:'100%', justifyContent:'center'}}
                  disabled={checkoutLoading !== null}
                  onClick={() => handleCheckout(p.key)}
                >
                  {checkoutLoading === p.key ? 'Redirecionando...' : (planoAtual ? 'Mudar para este plano' : 'Assinar agora')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{marginTop:24}}>
        <div className="card-header"><div className="card-title">Histórico de faturas</div></div>
        <div style={{padding:'32px 18px', textAlign:'center', color:'var(--muted)', fontSize:13}}>
          {perfil.stripe_customer_id
            ? 'Acesse "Gerenciar assinatura" acima para ver suas faturas no portal Stripe.'
            : 'Nenhuma fatura encontrada. Assine um plano para ver o histórico de cobranças aqui.'}
        </div>
      </div>
    </>
  );
}

function TabEquipe({ equipe, setEquipe }) {
  const [modal, setModal] = useState(null);
  const [salvo, setSalvo] = useState(false);

  const salvar = (form) => {
    if (form.id) setEquipe(e=>e.map(x=>x.id===form.id?form:x));
    else setEquipe(e=>[...e,{...form,id:Date.now()}]);
    setModal(null); setSalvo(true); setTimeout(()=>setSalvo(false),2500);
  };

  return (
    <>
      {salvo && <div className="alert-box alert-ok">✓ Membro da equipe salvo com sucesso.</div>}
      <div className="row-between mb-16">
        <div className="section-title" style={{marginBottom:0}}>Equipe</div>
        <button className="btn btn-primary" onClick={()=>setModal({})}>+ Convidar membro</button>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Papel</th><th>Comissão</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {equipe.map(m=>(
              <tr key={m.id}>
                <td className="bold">{m.nome}</td>
                <td className="text-muted">{m.email}</td>
                <td><span className={`badge ${m.papel==='admin'?'badge-gold':'badge-blue'}`}>{m.papel==='admin'?'Admin':'Barbeiro'}</span></td>
                <td>{m.papel==='barbeiro'?`${m.comissao}%`:'—'}</td>
                <td><span className={`badge ${m.ativo?'badge-green':'badge-gray'}`}>{m.ativo?'Ativo':'Inativo'}</span></td>
                <td>
                  <button className="btn btn-outline" style={{padding:'4px 10px',fontSize:11}} onClick={()=>setModal(m)}>Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal!==null && (
        <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&setModal(null)}>
          <div className="modal">
            <div className="modal-title">{modal.id?'Editar membro':'Convidar membro'}</div>
            <ModalEquipe membro={modal} onSave={salvar} onClose={()=>setModal(null)} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── ABA AUTOMAÇÕES ──────────────────────────────────────────────────────────
function TabAutomacoes({ perfil }) {
  const [loading, setLoading] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [config, setConfig] = useState({
    boas_vindas: '',
    confirmacao: '',
    lembrete: '',
    nps_request: '',
    whatsapp_url: 'https://api.evolution-api.com',
    whatsapp_instancia: '',
    whatsapp_token: ''
  });

  useEffect(() => {
    if (!perfil.tenant_id) return;
    async function carregar() {
      const { data } = await supabase.from('config_automacoes')
        .select('*')
        .eq('tenant_id', perfil.tenant_id)
        .maybeSingle();
      if (data) setConfig(prev => ({ ...prev, ...data }));
    }
    carregar();
  }, [perfil.tenant_id]);

  const salvar = async () => {
    if (!perfil.tenant_id) {
      alert('Perfil ainda não carregado. Aguarde e tente novamente.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('config_automacoes').upsert({
      tenant_id:          perfil.tenant_id,
      boas_vindas:        config.boas_vindas,
      confirmacao:        config.confirmacao,
      lembrete:           config.lembrete,
      nps_request:        config.nps_request,
      whatsapp_url:       config.whatsapp_url,
      whatsapp_instancia: config.whatsapp_instancia,
      whatsapp_token:     config.whatsapp_token,
      atualizado_em:      new Date().toISOString(),
    }, { onConflict: 'tenant_id' });

    setLoading(false);
    if (!error) {
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } else {
      console.error("Erro ao salvar automações:", error);
      alert('Erro ao salvar: ' + error.message);
    }
  };

  return (
    <>
      {salvo && <div className="alert-box alert-ok">✓ Configurações de automação salvas!</div>}

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Conexão WhatsApp</div>
            <div className="card-sub">Integração via Evolution API</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">URL da API</label>
            <input className="form-input" value={config.whatsapp_url} onChange={e=>setConfig({...config, whatsapp_url: e.target.value})} placeholder="https://api.evolution-api.com" />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Nome da Instância</label>
              <input className="form-input" value={config.whatsapp_instancia} onChange={e=>setConfig({...config, whatsapp_instancia: e.target.value})} placeholder="ex: BarberFlow_Main" />
            </div>
            <div className="form-group">
              <label className="form-label">API Key / Token</label>
              <input className="form-input" type="password" value={config.whatsapp_token} onChange={e=>setConfig({...config, whatsapp_token: e.target.value})} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Templates de Mensagens</div>
            <div className="card-sub">Use variáveis como {"{cliente_nome}"}, {"{barbearia_nome}"}, {"{data_hora}"}</div>
          </div>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Boas-vindas (Novo Cliente)</label>
            <textarea className="form-textarea" value={config.boas_vindas} onChange={e=>setConfig({...config, boas_vindas: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmação de Agendamento</label>
            <textarea className="form-textarea" value={config.confirmacao} onChange={e=>setConfig({...config, confirmacao: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Lembrete (X horas antes)</label>
            <textarea className="form-textarea" value={config.lembrete} onChange={e=>setConfig({...config, lembrete: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Solicitação de NPS (Pós-visita)</label>
            <textarea className="form-textarea" value={config.nps_request} onChange={e=>setConfig({...config, nps_request: e.target.value})} />
          </div>
          
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
            <button className="btn btn-primary" onClick={salvar} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Automações'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ModalEquipe({membro, onSave, onClose}) {
  const [form, setForm] = useState(membro||{nome:'',email:'',papel:'barbeiro',comissao:40,ativo:true});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  return (
    <>
      <div className="form-group"><label className="form-label">Nome</label><input className="form-input" value={form.nome} onChange={e=>set('nome',e.target.value)}/></div>
      <div className="form-group"><label className="form-label">E-mail</label><input className="form-input" type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Papel</label>
          <select className="form-select" value={form.papel} onChange={e=>set('papel',e.target.value)}>
            <option value="barbeiro">Barbeiro</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {form.papel==='barbeiro' && (
          <div className="form-group">
            <label className="form-label">Comissão (%)</label>
            <input className="form-input" type="number" value={form.comissao} onChange={e=>set('comissao',Number(e.target.value))} min={0} max={100}/>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" onClick={()=>onSave(form)} disabled={!form.nome||!form.email}>{form.id?'Salvar':'Convidar'}</button>
      </div>
    </>
  );
}

const initPerfil = {
  nome: 'Carregando...',
  slug: 'barbearia',
  telefone: '',
  email: '',
  endereco: '',
  descricao: '',
  cor_principal: '#B8973A',
  horario_abertura: '08:00',
  horario_fechamento: '19:00',
  dias_funcionamento: ['seg','ter','qua','qui','sex','sab'],
  plano_saas: null,
  stripe_customer_id: null,
  stripe_subscription_id: null,
};

const ABAS = [
  { key:'servicos', icon:'', label:'Serviços',       section:'Configuração' },
  { key:'planos',   icon:'', label:'Planos do clube', section:null },
  { key:'equipe',   icon:'', label:'Equipe',          section:null },
  { key:'perfil',   icon:'', label:'Perfil',          section:null },
  { key:'automacoes', icon:'', label:'Automação',       section:'Sistema' },
  { key:'billing',  icon:'', label:'Assinatura', section:null },
];

const initServicos = [];
const initPlanos = [];

export default function ConfiguracaoBarbearia() {
  const [aba, setAba] = useState('servicos');
  const [perfil, setPerfil] = useState(initPerfil);
  const [servicos, setServicos] = useState(initServicos);
  const [planos, setPlanos] = useState(initPlanos);
  const [equipe, setEquipe] = useState(initEquipe);

  useEffect(() => {
    async function carregarDados() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Carregar Perfil do usuário logado
      const { data: pData } = await supabase.from('barbearia_perfis')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (pData) {
        setPerfil({
           id:                     pData.id,
           tenant_id:              pData.tenant_id,
           nome:                   pData.nome || '',
           slug:                   pData.slug || '',
           telefone:               pData.telefone || '',
           email:                  pData.email || '',
           endereco:               pData.endereco || '',
           descricao:              pData.descricao || '',
           cor_principal:          pData.cor_principal || '#B8973A',
           horario_abertura:       (pData.horario_abertura || '08:00').slice(0,5),
           horario_fechamento:     (pData.horario_fechamento || '19:00').slice(0,5),
           dias_funcionamento:     pData.dias_funcionamento || ['seg','ter','qua','qui','sex','sab'],
           plano_saas:             pData.plano_saas || null,
           stripe_customer_id:     pData.stripe_customer_id || null,
           stripe_subscription_id: pData.stripe_subscription_id || null,
        });
      }

      // Carregar Serviços
      const { data: sData } = await supabase.from('servicos').select('*').order('categoria');
      if (sData) setServicos(sData.map(s => ({ ...s, duracao: s.duracao_min })));

      // Carregar Planos
      const { data: plData } = await supabase.from('planos').select('*').order('preco');
      if (plData) {
        setPlanos((plData || []).map(p => ({
          ...p,
          servicos: p.servicos_incluidos || [],
          visitas: p.visitas_mes || 0,
          ilimitado: p.visitas_ilimitadas || false,
          destaque: p.featured || false,
        })));
      }
    }
    carregarDados();
  }, []);

  const titulos = {
    servicos: { title:'Serviços e preços', sub:'Gerencie os serviços disponíveis para agendamento' },
    planos:   { title:'Planos do clube',   sub:'Configure os planos de assinatura da sua barbearia' },
    equipe:   { title:'Equipe',            sub:'Gerencie barbeiros e administradores' },
    perfil:   { title:'Perfil da barbearia', sub:'Informações exibidas no app do cliente' },
    automacoes: { title:'Automações de WhatsApp', sub:'Configure mensagens automáticas e lembretes' },
    billing: { title:'Assinatura e Faturamento', sub:'Gerencie seu plano BarberFlow e pagamentos' },
  };

  let lastSection = null;

  return (
    <div className="cfg">
      <style>{css}</style>
      <div className="cfg-layout">

        {/* Sidebar */}
        <div className="cfg-sidebar">
          <div className="cfg-logo">
            <div className="cfg-logo-name">BarberFlow</div>
            <div className="cfg-logo-sub">Configurações</div>
          </div>
          <nav className="cfg-nav">
            {ABAS.map(a => {
              const showSec = a.section && a.section !== lastSection;
              if (a.section) lastSection = a.section;
              return (
                <div key={a.key}>
                  {showSec && <div className="cfg-nav-section">{a.section}</div>}
                  <div
                    className={`cfg-nav-item ${aba===a.key?'active':''}`}
                    onClick={()=>!a.disabled&&setAba(a.key)}
                    style={a.disabled?{opacity:0.35,cursor:'default'}:{}}>
                    <span className="cfg-nav-icon">{a.icon}</span>
                    {a.label}
                    {a.disabled && <span style={{marginLeft:'auto',fontSize:8,color:'rgba(255,255,255,0.2)',letterSpacing:1}}>EM BREVE</span>}
                  </div>
                </div>
              );
            })}
          </nav>
          <div className="cfg-user">
            <div className="cfg-user-avatar">{perfil.nome?.substring(0,2).toUpperCase()}</div>
            <div>
              <div className="cfg-user-name">{perfil.nome}</div>
              <div className="cfg-user-role">Painel de Controle</div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="cfg-main">
          <div className="cfg-topbar">
            <div>
              <div className="cfg-page-title">{titulos[aba]?.title || aba}</div>
              <div className="cfg-page-sub">{titulos[aba]?.sub || ''}</div>
            </div>
          </div>
          <div className="cfg-content">
            {aba==='servicos' && <TabServicos servicos={servicos} setServicos={setServicos} />}
            {aba==='planos'   && <TabPlanos planos={planos} setPlanos={setPlanos} />}
            {aba==='equipe'   && <TabEquipe equipe={equipe} setEquipe={setEquipe} />}
            {aba==='perfil'   && <TabPerfil perfil={perfil} setPerfil={setPerfil} />}
            {aba==='automacoes' && <TabAutomacoes perfil={perfil} />}
            {aba==='billing'    && <TabBilling perfil={perfil} />}
          </div>
        </div>
      </div>
    </div>
  );
}
