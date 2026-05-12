import { useState } from "react";

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ca * { box-sizing: border-box; margin: 0; padding: 0; }
  .ca {
    font-family: 'DM Sans', sans-serif;
    --gold: #B8973A; --gold-l: #D4AF5A; --gold-p: #FAF0D4;
    --dark: #1A1610; --dark2: #252018; --surf: #FAFAF8;
    --white: #FFFFFF; --muted: #7A7060; --faint: #B4AFA5;
    --bord: #E8E2D4; --green: #2D6E3E; --green-b: #EAF4ED;
    --red: #A32D2D; --red-b: #FCEBEB;
    --amb: #854F0B; --amb-b: #FAEEDA;
    --blue: #185FA5; --blue-b: #E6F1FB;
    background: var(--dark);
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  }

  /* Simulação de tela mobile */
  .phone-frame {
    width: 390px; max-width: 100%;
    background: var(--surf);
    border-radius: 40px;
    overflow: hidden;
    min-height: 780px;
    display: flex; flex-direction: column;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
    position: relative;
  }

  /* Status bar */
  .status-bar {
    background: var(--dark);
    padding: 14px 24px 8px;
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }
  .status-time { font-size: 13px; font-weight: 600; color: var(--white); }
  .status-icons { display: flex; gap: 5px; align-items: center; }
  .status-icon { font-size: 12px; color: var(--white); }

  /* Header */
  .app-header {
    background: var(--dark);
    padding: 12px 20px 20px;
    flex-shrink: 0;
  }
  .header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .logo-text { font-family: 'Playfair Display', serif; font-size: 18px; color: var(--gold); font-weight: 600; }
  .notif-btn { width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.08); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; position: relative; }
  .notif-dot { position: absolute; top: 6px; right: 6px; width: 8px; height: 8px; border-radius: 50%; background: var(--gold); border: 2px solid var(--dark); }
  .welcome-row { display: flex; align-items: center; gap: 12px; }
  .user-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gold); display: flex; align-items: center; justify-content: center; font-family: 'Playfair Display', serif; font-size: 17px; color: var(--dark); font-weight: 600; flex-shrink: 0; }
  .welcome-name { font-family: 'Playfair Display', serif; font-size: 17px; color: var(--white); font-weight: 600; }
  .welcome-plan { font-size: 11px; color: var(--gold-l); margin-top: 2px; display: flex; align-items: center; gap: 4px; }

  /* Content area */
  .app-content { flex: 1; overflow-y: auto; background: var(--surf); }
  .app-content::-webkit-scrollbar { display: none; }

  /* Bottom nav */
  .bottom-nav {
    background: var(--white); border-top: 1px solid var(--bord);
    padding: 10px 0 20px; display: flex; flex-shrink: 0;
  }
  .nav-tab { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; cursor: pointer; padding: 4px 0; transition: all 0.15s; border: none; background: none; }
  .nav-tab-icon { font-size: 20px; line-height: 1; }
  .nav-tab-label { font-size: 9px; font-weight: 500; color: var(--faint); letter-spacing: 0.3px; font-family: 'DM Sans', sans-serif; }
  .nav-tab.active .nav-tab-label { color: var(--gold); }
  .nav-tab.active .nav-tab-icon { filter: none; }
  .nav-tab-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); margin-top: 2px; }

  /* Cards */
  .card { background: var(--white); border: 1px solid var(--bord); border-radius: 16px; padding: 16px; margin: 0 16px 12px; }
  .card-dark { background: var(--dark); border: none; }
  .card-gold { background: var(--gold-p); border-color: #D4AF5A; }

  /* Section headers */
  .section-head { padding: 16px 20px 8px; display: flex; align-items: center; justify-content: space-between; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; color: var(--dark); }
  .section-link { font-size: 12px; color: var(--gold); font-weight: 500; cursor: pointer; }

  /* Clube card */
  .clube-card {
    margin: 16px 16px 12px;
    background: var(--dark2);
    border: 1px solid rgba(184,151,58,0.3);
    border-radius: 18px; padding: 18px;
    position: relative; overflow: hidden;
  }
  .clube-bg { position: absolute; right: -10px; top: -10px; width: 120px; height: 120px; border-radius: 50%; background: rgba(184,151,58,0.06); }
  .clube-badge { display: inline-flex; align-items: center; gap: 5px; background: rgba(184,151,58,0.15); border: 1px solid rgba(184,151,58,0.3); border-radius: 20px; padding: 4px 10px; font-size: 10px; color: var(--gold-l); font-weight: 600; letter-spacing: 0.5px; margin-bottom: 10px; }
  .clube-nome { font-family: 'Playfair Display', serif; font-size: 20px; color: var(--white); font-weight: 600; margin-bottom: 4px; }
  .clube-desc { font-size: 12px; color: rgba(255,255,255,0.45); margin-bottom: 14px; }
  .clube-uso { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .clube-uso-label { font-size: 11px; color: rgba(255,255,255,0.5); }
  .clube-uso-val { font-size: 11px; color: var(--gold-l); font-weight: 500; }
  .uso-bar { height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; margin-bottom: 14px; }
  .uso-fill { height: 100%; border-radius: 3px; background: var(--gold); }
  .clube-renova { font-size: 10px; color: rgba(255,255,255,0.3); }

  /* Próxima visita */
  .proxima-card { margin: 0 16px 12px; background: var(--white); border: 1px solid var(--bord); border-radius: 16px; overflow: hidden; }
  .proxima-header { background: var(--dark); padding: 10px 14px; display: flex; align-items: center; gap: 8px; }
  .proxima-label { font-size: 10px; color: var(--gold-l); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; }
  .proxima-body { padding: 14px; }
  .proxima-data { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; margin-bottom: 4px; }
  .proxima-svc { font-size: 13px; color: var(--muted); margin-bottom: 10px; }
  .proxima-barb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted); }
  .barb-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--gold-p); border: 1px solid #D4AF5A; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: var(--amb); }
  .proxima-actions { display: flex; gap: 8px; margin-top: 12px; }
  .btn-sm { flex: 1; padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 500; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.15s; text-align: center; }
  .btn-dark { background: var(--dark); color: var(--gold-l); }
  .btn-out { background: transparent; border: 1px solid var(--bord); color: var(--dark); }
  .btn-gold { background: var(--gold); color: var(--dark); }
  .btn-green { background: var(--green-b); color: var(--green); border: 1px solid #97C459; }
  .btn-full { width: 100%; padding: 12px; border-radius: 10px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }

  /* Histórico */
  .hist-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--bord); }
  .hist-item:last-child { border-bottom: none; }
  .hist-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
  .hist-dot-old { background: var(--bord); }
  .hist-date { font-size: 11px; color: var(--muted); min-width: 70px; }
  .hist-svc { font-size: 13px; font-weight: 500; flex: 1; }
  .hist-val { font-size: 12px; font-weight: 600; color: var(--dark); }
  .hist-stars { font-size: 10px; color: var(--gold); }

  /* NPS */
  .nps-wrap { padding: 20px 16px; }
  .nps-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; margin-bottom: 6px; text-align: center; }
  .nps-sub { font-size: 13px; color: var(--muted); text-align: center; margin-bottom: 20px; line-height: 1.5; }
  .nps-svc-card { background: var(--dark); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; display: flex; gap: 12px; align-items: center; }
  .nps-svc-icon { font-size: 24px; }
  .nps-svc-name { font-size: 14px; font-weight: 500; color: var(--white); }
  .nps-svc-date { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
  .nps-scale { margin-bottom: 20px; }
  .nps-scale-label { display: flex; justify-content: space-between; font-size: 10px; color: var(--muted); margin-bottom: 8px; }
  .nps-nums { display: grid; grid-template-columns: repeat(11,1fr); gap: 4px; }
  .nps-num { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: 1px solid var(--bord); background: var(--white); color: var(--dark); }
  .nps-num:hover { border-color: var(--gold); }
  .nps-num.sel-red { background: var(--red); border-color: var(--red); color: var(--white); }
  .nps-num.sel-amb { background: #EF9F27; border-color: #EF9F27; color: var(--white); }
  .nps-num.sel-green { background: var(--green); border-color: var(--green); color: var(--white); }
  .nps-comment { width: 100%; padding: 12px; border: 1px solid var(--bord); border-radius: 10px; font-size: 13px; font-family: 'DM Sans', sans-serif; resize: none; outline: none; color: var(--dark); min-height: 80px; margin-bottom: 14px; }
  .nps-comment:focus { border-color: var(--gold); }
  .nps-aspects { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
  .aspect-btn { padding: 8px 10px; border-radius: 8px; border: 1px solid var(--bord); background: var(--white); font-size: 11px; font-weight: 500; cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'DM Sans', sans-serif; color: var(--dark); }
  .aspect-btn.sel { background: var(--green-b); border-color: var(--green); color: var(--green); }
  .nps-done { text-align: center; padding: 30px 0; }
  .nps-done-icon { font-size: 56px; margin-bottom: 12px; }
  .nps-done-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
  .nps-done-sub { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* Indicação */
  .ind-hero { background: var(--dark2); border-radius: 18px; padding: 20px; margin: 16px; text-align: center; border: 1px solid rgba(184,151,58,0.2); }
  .ind-icon { font-size: 40px; margin-bottom: 10px; }
  .ind-title { font-family: 'Playfair Display', serif; font-size: 19px; color: var(--white); font-weight: 600; margin-bottom: 6px; }
  .ind-desc { font-size: 12px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 16px; }
  .ind-code-wrap { background: rgba(184,151,58,0.1); border: 1px solid rgba(184,151,58,0.3); border-radius: 12px; padding: 14px; margin-bottom: 14px; }
  .ind-code-label { font-size: 10px; color: var(--gold-l); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .ind-code { font-family: 'Playfair Display', serif; font-size: 28px; color: var(--gold); font-weight: 700; letter-spacing: 4px; }
  .ind-share { display: flex; gap: 8px; margin-bottom: 20px; }
  .ind-share-btn { flex: 1; padding: 10px 8px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); font-size: 11px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; display: flex; align-items: center; justify-content: center; gap: 5px; }
  .ind-share-btn:hover { background: rgba(255,255,255,0.1); }
  .ind-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .ind-stat { background: rgba(255,255,255,0.05); border-radius: 10px; padding: 10px; text-align: center; }
  .ind-stat-val { font-size: 20px; font-weight: 600; color: var(--gold); font-family: 'Playfair Display', serif; }
  .ind-stat-label { font-size: 9px; color: rgba(255,255,255,0.4); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
  .ind-hist { margin: 0 16px; }
  .ind-hist-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--bord); }
  .ind-hist-item:last-child { border-bottom: none; }
  .ind-hist-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--gold-p); border: 1px solid #D4AF5A; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: var(--amb); flex-shrink: 0; }
  .ind-hist-name { font-size: 13px; font-weight: 500; }
  .ind-hist-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .ind-hist-premio { margin-left: auto; font-size: 12px; font-weight: 600; color: var(--green); }

  /* Gift Card */
  .gift-hero { margin: 16px; border-radius: 18px; overflow: hidden; }
  .gift-card-visual {
    background: var(--dark2);
    padding: 24px; position: relative; overflow: hidden;
    border: 1px solid rgba(184,151,58,0.2);
    border-radius: 18px 18px 0 0;
  }
  .gift-bg1 { position: absolute; right: -20px; bottom: -20px; width: 140px; height: 140px; border-radius: 50%; background: rgba(184,151,58,0.07); }
  .gift-bg2 { position: absolute; right: 30px; bottom: 20px; width: 80px; height: 80px; border-radius: 50%; background: rgba(184,151,58,0.05); }
  .gift-logo { font-family: 'Playfair Display', serif; font-size: 14px; color: var(--gold-l); font-weight: 600; margin-bottom: 16px; opacity: 0.7; }
  .gift-value { font-family: 'Playfair Display', serif; font-size: 48px; color: var(--gold); font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .gift-value-label { font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
  .gift-code { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--white); letter-spacing: 3px; font-weight: 400; opacity: 0.8; }
  .gift-para { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px; }
  .gift-actions { background: var(--white); border: 1px solid var(--bord); border-top: none; border-radius: 0 0 18px 18px; padding: 16px; }
  .gift-valores { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 14px; }
  .gift-val-btn { padding: 10px 4px; border-radius: 10px; border: 1px solid var(--bord); background: var(--white); font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.15s; font-family: 'DM Sans', sans-serif; color: var(--dark); }
  .gift-val-btn.sel { background: var(--dark); border-color: var(--dark); color: var(--gold-l); }
  .gift-form-row { display: flex; gap: 8px; margin-bottom: 10px; }
  .gift-input { flex: 1; padding: 10px 12px; border: 1px solid var(--bord); border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; color: var(--dark); }
  .gift-input:focus { border-color: var(--gold); }
  .gift-meus { margin: 16px 16px 0; }
  .gift-meu-item { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; padding: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
  .gift-meu-icon { font-size: 24px; width: 40px; text-align: center; }
  .gift-meu-val { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 600; color: var(--gold); }
  .gift-meu-code { font-size: 11px; color: var(--muted); font-family: monospace; margin-top: 2px; }
  .gift-meu-status { margin-left: auto; }

  /* Badge genérico */
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-gold { background: var(--gold-p); color: var(--amb); }
  .badge-green { background: var(--green-b); color: var(--green); }
  .badge-gray { background: #F1EFE8; color: #5F5E5A; }
  .badge-blue { background: var(--blue-b); color: var(--blue); }

  /* Quick actions */
  .quick-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin: 0 16px 16px; }
  .quick-btn { background: var(--white); border: 1px solid var(--bord); border-radius: 14px; padding: 12px 6px; display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; transition: all 0.15s; }
  .quick-btn:hover { border-color: var(--gold); background: var(--gold-p); }
  .quick-icon { font-size: 22px; }
  .quick-label { font-size: 9px; font-weight: 500; color: var(--muted); text-align: center; line-height: 1.3; }

  /* Misc */
  .mt-4 { margin-top: 4px; }
  .pb-safe { padding-bottom: 8px; }
  .text-muted { color: var(--muted); }
  .text-small { font-size: 11px; }
  .bold { font-weight: 600; }
  .row { display: flex; align-items: center; gap: 8px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; }
`;

// ─── DADOS MOCK ───────────────────────────────────────────────────────────────
const cliente = {
  nome: "Carlos Ferreira", iniciais: "CF",
  plano: "Clube Black", visitas_mes: 3, limite_mes: null,
  proxima: { data: "Quinta, 10 Abr", hora: "10:00", svc: "Corte Fade + Barba", barb: "Rafael M." },
  historico: [
    { data: "26 Mar", svc: "Corte Fade + Barba + Skincare", valor: 320, estrelas: 5 },
    { data: "19 Mar", svc: "Barba modelada + Sobrancelha",  valor: 180, estrelas: 5 },
    { data: "12 Mar", svc: "Corte completo + Terapia facial", valor: 290, estrelas: 4 },
    { data: "05 Mar", svc: "Barba + Hidratação capilar",    valor: 220, estrelas: 5 },
  ],
  codigo_indicacao: "CARL2024",
  indicacoes: [
    { iniciais: "PR", nome: "Pedro Rocha",  data: "15 Mar", premio: "R$30" },
    { iniciais: "MS", nome: "Marcos Silva", data: "02 Mar", premio: "R$30" },
    { iniciais: "FO", nome: "Felipe Oliv.", data: "18 Fev", premio: "R$30" },
  ],
  gift_cards: [
    { valor: 100, code: "GIFT-8X4K-2026", para: "Você", status: "ativo" },
    { valor: 150, code: "GIFT-9Z2M-2026", para: "João M.", status: "usado" },
  ],
};

// ─── NPS ─────────────────────────────────────────────────────────────────────
function TabNPS() {
  const [nota, setNota] = useState(null);
  const [aspectos, setAspectos] = useState([]);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);

  const toggleAspecto = (a) =>
    setAspectos(prev => prev.includes(a) ? prev.filter(x=>x!==a) : [...prev,a]);

  const corNota = (n) => {
    if (n === null) return "";
    if (n <= 6) return "sel-red";
    if (n <= 8) return "sel-amb";
    return "sel-green";
  };

  if (enviado) return (
    <div className="nps-wrap">
      <div className="nps-done">
        <div className="nps-done-icon">🎉</div>
        <div className="nps-done-title">Obrigado, Carlos!</div>
        <div className="nps-done-sub">
          Sua avaliação foi registrada.<br/>
          Ela nos ajuda a melhorar cada visita.
        </div>
        {nota >= 9 && (
          <div style={{marginTop:20, background:"var(--gold-p)", border:"1px solid #D4AF5A", borderRadius:12, padding:"14px 16px", textAlign:"left"}}>
            <div style={{fontSize:12, fontWeight:600, color:"var(--amb)", marginBottom:4}}>Que tal indicar um amigo?</div>
            <div style={{fontSize:11, color:"var(--amb-b)", lineHeight:1.5}}>Você ganha R$30 de desconto para cada indicação que virar cliente.</div>
            <div style={{marginTop:10, fontSize:14, fontWeight:700, color:"var(--gold)", fontFamily:"'Playfair Display',serif", letterSpacing:2}}>CARL2024</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="nps-wrap">
      <div className="nps-title">Como foi sua visita?</div>
      <div className="nps-sub">Sua opinião melhora cada atendimento</div>

      <div className="nps-svc-card">
        <div className="nps-svc-icon">✂️</div>
        <div>
          <div className="nps-svc-name">Corte Fade + Barba Luxo</div>
          <div className="nps-svc-date">26 de março · Rafael M.</div>
        </div>
      </div>

      <div className="nps-scale">
        <div style={{fontSize:13, fontWeight:500, marginBottom:10}}>
          De 0 a 10, quanto você recomendaria a BarberFlow?
        </div>
        <div className="nps-scale-label">
          <span>Não recomendo</span>
          <span>Recomendo muito</span>
        </div>
        <div className="nps-nums">
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <div key={n} className={`nps-num ${nota===n ? corNota(n) : ""}`} onClick={()=>setNota(n)}>{n}</div>
          ))}
        </div>
      </div>

      {nota !== null && (
        <>
          <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>O que mais gostou?</div>
          <div className="nps-aspects">
            {["Atendimento","Resultado","Pontualidade","Ambiente","Preço","Produto"].map(a=>(
              <button key={a} className={`aspect-btn ${aspectos.includes(a)?"sel":""}`} onClick={()=>toggleAspecto(a)}>{a}</button>
            ))}
          </div>

          <div style={{fontSize:13,fontWeight:500,marginBottom:8}}>Quer deixar um comentário?</div>
          <textarea className="nps-comment" placeholder="Conte sua experiência..."
            value={comentario} onChange={e=>setComentario(e.target.value)} />
        </>
      )}

      <button className="btn-full btn-dark" disabled={nota===null}
        style={{opacity:nota===null?0.4:1}} onClick={()=>setEnviado(true)}>
        Enviar avaliação
      </button>
    </div>
  );
}

// ─── INDICAÇÃO ────────────────────────────────────────────────────────────────
function TabIndicacao() {
  const [copiado, setCopiado] = useState(false);

  const copiar = () => {
    setCopiado(true);
    setTimeout(()=>setCopiado(false), 2000);
  };

  return (
    <div className="pb-safe">
      <div className="ind-hero">
        <div className="ind-icon">🤝</div>
        <div className="ind-title">Indique e ganhe</div>
        <div className="ind-desc">
          Para cada amigo que você indicar e virar cliente,<br/>
          você recebe <strong style={{color:"var(--gold-l)"}}>R$30 de desconto</strong> na próxima visita.
        </div>

        <div className="ind-code-wrap">
          <div className="ind-code-label">Seu código exclusivo</div>
          <div className="ind-code">{cliente.codigo_indicacao}</div>
        </div>

        <div className="ind-share">
          <button className="ind-share-btn" onClick={copiar}>
            {copiado ? "✓ Copiado!" : "📋 Copiar"}
          </button>
          <button className="ind-share-btn">
            💬 WhatsApp
          </button>
          <button className="ind-share-btn">
            📤 Compartilhar
          </button>
        </div>

        <div className="ind-stats">
          <div className="ind-stat">
            <div className="ind-stat-val">3</div>
            <div className="ind-stat-label">Indicações</div>
          </div>
          <div className="ind-stat">
            <div className="ind-stat-val">R$90</div>
            <div className="ind-stat-label">Ganho total</div>
          </div>
          <div className="ind-stat">
            <div className="ind-stat-val">R$30</div>
            <div className="ind-stat-label">Disponível</div>
          </div>
        </div>
      </div>

      <div className="section-head">
        <div className="section-title">Suas indicações</div>
      </div>

      <div className="ind-hist">
        {cliente.indicacoes.map((ind,i) => (
          <div key={i} className="ind-hist-item">
            <div className="ind-hist-avatar">{ind.iniciais}</div>
            <div>
              <div className="ind-hist-name">{ind.nome}</div>
              <div className="ind-hist-sub">Entrou em {ind.data}</div>
            </div>
            <div className="ind-hist-premio">+{ind.premio}</div>
          </div>
        ))}
      </div>

      <div style={{margin:"16px",background:"var(--surf)",border:"1px solid var(--bord)",borderRadius:12,padding:"14px 16px"}}>
        <div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.8px",color:"var(--muted)",marginBottom:8}}>Como funciona</div>
        {["Compartilhe seu código com amigos","Amigo agenda com seu código","Quando ele virar cliente confirmado","Você recebe R$30 de desconto automático"].map((s,i)=>(
          <div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
            <div style={{width:20,height:20,borderRadius:"50%",background:"var(--dark)",color:"var(--gold)",fontSize:10,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
            <div style={{fontSize:12,color:"var(--muted)",lineHeight:1.4}}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── GIFT CARD ────────────────────────────────────────────────────────────────
function TabGiftCard() {
  const [valor, setValor] = useState(100);
  const [para, setPara] = useState("");
  const [msg, setMsg] = useState("");
  const [comprado, setComprado] = useState(false);

  const valores = [50, 100, 150, 200];

  return (
    <div className="pb-safe">
      <div className="section-head" style={{paddingTop:16}}>
        <div className="section-title">Gift Card digital</div>
        <span className="badge badge-gold">Novo</span>
      </div>

      <div className="gift-hero">
        {/* Visual do card */}
        <div className="gift-card-visual">
          <div className="gift-bg1" /><div className="gift-bg2" />
          <div className="gift-logo">BarberFlow</div>
          <div className="gift-value">R${valor}</div>
          <div className="gift-value-label">Vale-presente digital</div>
          <div className="gift-code">GIFT-XXXX-2026</div>
          <div className="gift-para">{para ? `Para: ${para}` : "Para: destinatário"}</div>
        </div>

        {!comprado ? (
          <div className="gift-actions">
            <div style={{fontSize:12,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Escolha o valor</div>
            <div className="gift-valores">
              {valores.map(v=>(
                <button key={v} className={`gift-val-btn ${valor===v?"sel":""}`} onClick={()=>setValor(v)}>R${v}</button>
              ))}
            </div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:8}}>Para quem é?</div>
            <div className="gift-form-row">
              <input className="gift-input" placeholder="Nome do presenteado" value={para} onChange={e=>setPara(e.target.value)} />
            </div>
            <div className="gift-form-row">
              <input className="gift-input" placeholder="Mensagem personalizada (opcional)" value={msg} onChange={e=>setMsg(e.target.value)} />
            </div>
            <button className="btn-full btn-gold" onClick={()=>setComprado(true)}>
              Comprar gift card — R${valor}
            </button>
          </div>
        ) : (
          <div className="gift-actions" style={{textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🎉</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:600,marginBottom:4}}>Gift card enviado!</div>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:14}}>
              {para} vai receber o código por WhatsApp agora.
            </div>
            <button className="btn-full btn-out" onClick={()=>setComprado(false)}>Enviar outro</button>
          </div>
        )}
      </div>

      <div className="section-head">
        <div className="section-title">Meus gift cards</div>
      </div>

      <div className="gift-meus">
        {cliente.gift_cards.map((g,i) => (
          <div key={i} className="gift-meu-item">
            <div className="gift-meu-icon">🎁</div>
            <div>
              <div className="gift-meu-val">R${g.valor}</div>
              <div className="gift-meu-code">{g.code}</div>
              <div style={{fontSize:11,color:"var(--muted)",marginTop:2}}>Para: {g.para}</div>
            </div>
            <div className="gift-meu-status">
              <span className={`badge ${g.status==="ativo"?"badge-green":"badge-gray"}`}>
                {g.status==="ativo"?"Ativo":"Usado"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function TabHome({ setTab }) {
  return (
    <div className="pb-safe">
      {/* Clube card */}
      <div className="clube-card">
        <div className="clube-bg" />
        <div className="clube-badge">★ {cliente.plano}</div>
        <div className="clube-nome">Olá, Carlos!</div>
        <div className="clube-desc">Seu clube premium está ativo</div>
        <div className="clube-uso">
          <span className="clube-uso-label">Visitas este mês</span>
          <span className="clube-uso-val">{cliente.visitas_mes} / ilimitado</span>
        </div>
        <div className="uso-bar">
          <div className="uso-fill" style={{width:"40%"}} />
        </div>
        <div className="clube-renova">Renova em 30 de abril</div>
      </div>

      {/* Próxima visita */}
      <div className="proxima-card">
        <div className="proxima-header">
          <span style={{fontSize:14}}>📅</span>
          <span className="proxima-label">Próxima visita</span>
        </div>
        <div className="proxima-body">
          <div className="proxima-data">{cliente.proxima.data} · {cliente.proxima.hora}</div>
          <div className="proxima-svc">{cliente.proxima.svc}</div>
          <div className="proxima-barb">
            <div className="barb-avatar">RM</div>
            <span>com {cliente.proxima.barb}</span>
          </div>
          <div className="proxima-actions">
            <button className="btn-sm btn-out">Reagendar</button>
            <button className="btn-sm btn-dark">Ver detalhes</button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="quick-grid">
        {[
          { icon:"📅", label:"Agendar visita",   tab:"agenda" },
          { icon:"⭐", label:"Avaliar visita",    tab:"nps" },
          { icon:"🤝", label:"Indicar amigo",     tab:"indicacao" },
          { icon:"🎁", label:"Gift card",         tab:"gift" },
        ].map(q=>(
          <div key={q.tab} className="quick-btn" onClick={()=>setTab(q.tab)}>
            <div className="quick-icon">{q.icon}</div>
            <div className="quick-label">{q.label}</div>
          </div>
        ))}
      </div>

      {/* Histórico */}
      <div className="section-head">
        <div className="section-title">Últimas visitas</div>
        <span className="section-link">Ver tudo</span>
      </div>
      <div className="card">
        {cliente.historico.map((h,i)=>(
          <div key={i} className="hist-item">
            <div className={`hist-dot ${i>0?"hist-dot-old":""}`} />
            <div className="hist-date">{h.data}</div>
            <div style={{flex:1}}>
              <div className="hist-svc">{h.svc}</div>
              <div className="hist-stars">{"★".repeat(h.estrelas)}</div>
            </div>
            <div className="hist-val">R${h.valor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function ClienteApp() {
  const [tab, setTab] = useState("home");

  const navItems = [
    { key:"home",      icon:"🏠", label:"Início"    },
    { key:"agenda",    icon:"📅", label:"Agenda"    },
    { key:"nps",       icon:"⭐", label:"Avaliar"   },
    { key:"indicacao", icon:"🤝", label:"Indicar"   },
    { key:"gift",      icon:"🎁", label:"Gift Card" },
  ];

  return (
    <div className="ca">
      <style>{css}</style>
      <div className="phone-frame">

        {/* Status bar */}
        <div className="status-bar">
          <span className="status-time">9:41</span>
          <div className="status-icons">
            <span className="status-icon">●●●</span>
            <span className="status-icon">WiFi</span>
            <span className="status-icon">🔋</span>
          </div>
        </div>

        {/* Header */}
        <div className="app-header">
          <div className="header-row">
            <span className="logo-text">BarberFlow</span>
            <button className="notif-btn">
              🔔<div className="notif-dot" />
            </button>
          </div>
          <div className="welcome-row">
            <div className="user-avatar">{cliente.iniciais}</div>
            <div>
              <div className="welcome-name">{cliente.nome}</div>
              <div className="welcome-plan">★ {cliente.plano}</div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="app-content">
          {tab === "home"      && <TabHome setTab={setTab} />}
          {tab === "nps"       && <TabNPS />}
          {tab === "indicacao" && <TabIndicacao />}
          {tab === "gift"      && <TabGiftCard />}
          {tab === "agenda"    && (
            <div style={{padding:"40px 20px",textAlign:"center"}}>
              <div style={{fontSize:40,marginBottom:12}}>📅</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:600,marginBottom:8}}>Agendar visita</div>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:20,lineHeight:1.5}}>
                Escolha o serviço, barbeiro e horário que preferir
              </div>
              <button className="btn-full btn-dark" onClick={()=>setTab("home")}>← Voltar</button>
            </div>
          )}
        </div>

        {/* Bottom Nav */}
        <div className="bottom-nav">
          {navItems.map(n=>(
            <button key={n.key} className={`nav-tab ${tab===n.key?"active":""}`} onClick={()=>setTab(n.key)}>
              <div className="nav-tab-icon">{n.icon}</div>
              <div className="nav-tab-label">{n.label}</div>
              {tab===n.key && <div className="nav-tab-dot" />}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
