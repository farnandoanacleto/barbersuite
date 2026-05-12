import { useState, useMemo } from "react";

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .fin * { box-sizing: border-box; margin: 0; padding: 0; }
  .fin {
    font-family: 'DM Sans', sans-serif;
    --gold: #B8973A; --gold-l: #D4AF5A; --gold-p: #FAF0D4;
    --dark: #1A1610; --surf: #FAFAF8; --white: #FFFFFF;
    --muted: #7A7060; --faint: #B4AFA5; --bord: #E8E2D4;
    --green: #2D6E3E; --green-b: #EAF4ED;
    --red: #A32D2D;   --red-b: #FCEBEB;
    --amb: #854F0B;   --amb-b: #FAEEDA;
    --blue: #185FA5;  --blue-b: #E6F1FB;
    color: var(--dark); font-size: 14px; line-height: 1.5;
    background: var(--surf); min-height: 100vh;
  }

  /* layout */
  .fin-layout { display: flex; height: 100vh; overflow: hidden; }
  .fin-main   { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .fin-topbar {
    background: var(--white); border-bottom: 1px solid var(--bord);
    padding: 14px 28px; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0;
  }
  .fin-heading { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; }
  .fin-sub     { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .fin-content { flex: 1; overflow-y: auto; padding: 24px 28px; }

  /* tabs */
  .tab-bar { display: flex; gap: 2px; background: var(--bord); border-radius: 8px; padding: 3px; margin-bottom: 22px; }
  .tab-btn {
    flex: 1; padding: 8px 4px; border: none; border-radius: 6px;
    font-size: 12px; font-weight: 500; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
    background: transparent; color: var(--muted); white-space: nowrap;
  }
  .tab-btn.active { background: var(--dark); color: var(--gold-l); }
  .tab-btn:hover:not(.active) { background: rgba(0,0,0,0.05); color: var(--dark); }

  /* month selector */
  .month-sel { display: flex; align-items: center; gap: 8px; }
  .month-btn {
    width: 28px; height: 28px; border-radius: 6px;
    border: 1px solid var(--bord); background: var(--white);
    cursor: pointer; font-size: 13px; color: var(--muted);
    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  }
  .month-btn:hover { border-color: var(--dark); color: var(--dark); }
  .month-label { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 600; min-width: 130px; text-align: center; }

  /* stat cards */
  .stat-grid-5 { display: grid; grid-template-columns: repeat(5,1fr); gap: 12px; margin-bottom: 20px; }
  .stat-grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
  .stat-grid-3 { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
  .stat-card { background: var(--white); border: 1px solid var(--bord); border-radius: 10px; padding: 16px; }
  .stat-label { font-size: 10px; color: var(--muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; margin-top: 4px; line-height: 1; }
  .stat-trend { font-size: 11px; margin-top: 6px; display: flex; align-items: center; gap: 3px; }
  .up { color: var(--green); } .down { color: var(--red); } .neu { color: var(--muted); }

  /* DRE */
  .dre-wrap { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
  .dre-header { background: var(--dark); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
  .dre-title { font-family: 'Playfair Display', serif; font-size: 16px; color: var(--gold-l); font-weight: 600; }
  .dre-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
  .dre-row { display: flex; align-items: center; padding: 11px 20px; border-bottom: 1px solid var(--bord); transition: background 0.1s; }
  .dre-row:last-child { border-bottom: none; }
  .dre-row:hover { background: #FAF9F6; }
  .dre-row.total { background: var(--surf); font-weight: 600; }
  .dre-row.result { background: var(--gold-p); }
  .dre-row.section { background: var(--surf); }
  .dre-indent { margin-left: 18px; }
  .dre-label { flex: 1; font-size: 13px; }
  .dre-section-label { flex: 1; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); }
  .dre-val { font-size: 13px; font-weight: 500; min-width: 110px; text-align: right; }
  .dre-pct { font-size: 11px; color: var(--muted); min-width: 50px; text-align: right; }
  .dre-bar-wrap { width: 80px; height: 5px; background: var(--bord); border-radius: 3px; margin: 0 12px; overflow: hidden; }
  .dre-bar-fill { height: 100%; border-radius: 3px; }

  /* chart bars */
  .chart-wrap { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; padding: 18px; margin-bottom: 20px; }
  .chart-title { font-size: 13px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
  .bars { display: flex; align-items: flex-end; gap: 6px; height: 140px; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
  .bar-stack { flex: 1; width: 100%; display: flex; flex-direction: column; justify-content: flex-end; gap: 2px; border-radius: 4px 4px 0 0; overflow: hidden; cursor: pointer; }
  .bar-seg { width: 100%; transition: opacity 0.15s; }
  .bar-seg:hover { opacity: 0.85; }
  .bar-label { font-size: 9px; color: var(--muted); }
  .bar-val { font-size: 9px; font-weight: 600; color: var(--dark); }
  .chart-legend { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 12px; }
  .legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--muted); }
  .legend-dot { width: 9px; height: 9px; border-radius: 2px; }

  /* comissões */
  .com-card { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
  .com-header { background: var(--dark); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; }
  .com-title { font-size: 13px; font-weight: 500; color: var(--gold-l); }
  .com-row { display: grid; grid-template-columns: 200px 1fr 90px 90px 90px 110px 80px; gap: 0; border-bottom: 1px solid var(--bord); transition: background 0.1s; }
  .com-row:last-child { border-bottom: none; }
  .com-row:hover { background: #FAF9F6; cursor: pointer; }
  .com-row.header { background: var(--surf); }
  .com-cell { padding: 11px 14px; font-size: 12px; display: flex; align-items: center; }
  .com-cell.right { justify-content: flex-end; }
  .com-cell.center { justify-content: center; }
  .com-th { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); }
  .prog-wrap { flex: 1; height: 5px; background: var(--bord); border-radius: 3px; overflow: hidden; }
  .prog-fill { height: 100%; border-radius: 3px; background: var(--gold); }
  .pago-badge { padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .pago-sim { background: var(--green-b); color: var(--green); }
  .pago-nao { background: var(--amb-b); color: var(--amb); }

  /* inadimplência */
  .inad-alert { background: var(--red-b); border: 1px solid #F09595; border-radius: 10px; padding: 13px 16px; display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .inad-icon { font-size: 20px; flex-shrink: 0; }
  .inad-title { font-size: 13px; font-weight: 600; color: var(--red); }
  .inad-sub { font-size: 11px; color: #712B13; margin-top: 2px; }

  /* previsão */
  .prev-card { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; padding: 18px; margin-bottom: 20px; }
  .prev-num { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 600; color: var(--gold); }
  .prev-desc { font-size: 12px; color: var(--muted); margin-top: 6px; }
  .prev-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
  .prev-item { background: var(--surf); border-radius: 8px; padding: 12px; }
  .prev-item-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; }
  .prev-item-val { font-size: 18px; font-weight: 600; margin-top: 4px; font-family: 'Playfair Display', serif; }

  /* table geral */
  .tbl-wrap { background: var(--white); border: 1px solid var(--bord); border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
  .tbl-head { background: var(--dark); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .tbl-head-title { font-size: 13px; font-weight: 500; color: var(--gold-l); }
  table.fin-table { width: 100%; border-collapse: collapse; }
  table.fin-table th { background: var(--surf); padding: 9px 14px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.7px; color: var(--muted); border-bottom: 1px solid var(--bord); }
  table.fin-table td { padding: 10px 14px; border-bottom: 1px solid var(--bord); font-size: 12px; }
  table.fin-table tr:last-child td { border-bottom: none; }
  table.fin-table tr:hover td { background: #FAF9F6; cursor: pointer; }

  /* buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 7px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; font-family: 'DM Sans', sans-serif; white-space: nowrap; }
  .btn-primary { background: var(--gold); color: var(--dark); }
  .btn-primary:hover { background: var(--gold-l); }
  .btn-outline { background: transparent; border: 1px solid var(--bord); color: var(--dark); }
  .btn-outline:hover { background: var(--surf); }
  .btn-green { background: var(--green-b); color: var(--green); border: 1px solid #97C459; }
  .btn-red { background: var(--red-b); color: var(--red); border: 1px solid #F09595; }
  .btn-row { display: flex; gap: 8px; }

  /* badges */
  .badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-gold { background: var(--gold-p); color: var(--amb); }
  .badge-green { background: var(--green-b); color: var(--green); }
  .badge-red { background: var(--red-b); color: var(--red); }
  .badge-gray { background: #F1EFE8; color: #5F5E5A; }
  .badge-blue { background: var(--blue-b); color: var(--blue); }

  /* misc */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; }
  .section-title { font-family: 'Playfair Display', serif; font-size: 16px; font-weight: 600; margin-bottom: 14px; }
  .text-muted { color: var(--muted); }
  .text-small { font-size: 11px; }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-gold { color: var(--gold); }
  .text-blue { color: var(--blue); }
  .bold { font-weight: 600; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .divider { height: 1px; background: var(--bord); margin: 14px 0; }

  /* export modal */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(26,22,16,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
  .modal { background: var(--white); border-radius: 14px; padding: 26px; width: 420px; max-width: 100%; animation: mIn 0.18s ease; }
  @keyframes mIn { from { opacity:0; transform:translateY(-8px) scale(0.98); } to { opacity:1; transform:none; } }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 19px; font-weight: 600; margin-bottom: 18px; }
  .export-opt { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border: 1px solid var(--bord); border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; }
  .export-opt:hover { border-color: var(--gold); background: var(--gold-p); }
  .export-opt.selected { border-color: var(--gold); background: var(--gold-p); }
  .export-icon { font-size: 22px; width: 36px; text-align: center; }
  .export-name { font-size: 13px; font-weight: 500; }
  .export-desc { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .modal-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 18px; }
  .form-group { margin-bottom: 13px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px; }
  .form-select { width: 100%; padding: 8px 12px; border: 1px solid var(--bord); border-radius: 7px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: var(--dark); background: var(--white); outline: none; }
  .form-select:focus { border-color: var(--gold); }

  @media print {
    .fin-topbar, .tab-bar, .btn-row, .month-sel button { display: none !important; }
    .fin-content { padding: 0; }
  }
`;

// ─── DADOS MOCK ───────────────────────────────────────────────────────────────
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const dadosMensais = {
  "Mar/2026": {
    receita_avulsa: 23040,
    receita_clube:  18240,
    receita_total:  41280,
    despesas: {
      aluguel:       3200,
      produtos:      2100,
      energia:        480,
      internet:       180,
      sistema:        250,
      marketing:      600,
      manutencao:     320,
      outros:         410,
    },
    meta: 50000,
    atendimentos: 384,
    ticket_medio: 107.5,
  },
  "Fev/2026": {
    receita_avulsa: 19800,
    receita_clube:  17100,
    receita_total:  36180,
    despesas: { aluguel:3200, produtos:1800, energia:520, internet:180, sistema:250, marketing:400, manutencao:0, outros:390 },
    meta: 48000, atendimentos: 336, ticket_medio: 107.7,
  },
  "Jan/2026": {
    receita_avulsa: 17200,
    receita_clube:  16400,
    receita_total:  33600,
    despesas: { aluguel:3200, produtos:1650, energia:490, internet:180, sistema:250, marketing:300, manutencao:180, outros:320 },
    meta: 45000, atendimentos: 312, ticket_medio: 107.7,
  },
};

const barbeiros = [
  { id:1, nome:"Bruno K.",  faturamento:12400, pct:40, meta:13000, atendimentos:98,  ticket:127, comissao_paga:false },
  { id:2, nome:"Rafael M.", faturamento:11200, pct:40, meta:12000, atendimentos:91,  ticket:123, comissao_paga:true  },
  { id:3, nome:"Thiago S.", faturamento:9800,  pct:38, meta:12000, atendimentos:84,  ticket:117, comissao_paga:false },
  { id:4, nome:"Lucas P.",  faturamento:7880,  pct:38, meta:12000, atendimentos:72,  ticket:109, comissao_paga:false },
];

const inadimplentes = [
  { nome:"André Costa",   plano:"Barba",      valor:69,  dias:35, tentativas:3, telefone:"(41) 98888-1111" },
  { nome:"Roberto Lima",  plano:"Corte",       valor:89,  dias:22, tentativas:2, telefone:"(41) 97777-2222" },
  { nome:"Fábio Mendes",  plano:"Combo",       valor:139, dias:18, tentativas:1, telefone:"(41) 96666-3333" },
  { nome:"Eduardo Silva", plano:"Clube Black", valor:249, dias:12, tentativas:1, telefone:"(41) 95555-4444" },
];

const historico6m = [
  { mes:"Out/25", avulsa:14200, clube:13800 },
  { mes:"Nov/25", avulsa:16400, clube:14900 },
  { mes:"Dez/25", avulsa:21600, clube:15800 },
  { mes:"Jan/26", avulsa:17200, clube:16400 },
  { mes:"Fev/26", avulsa:19800, clube:17100 },
  { mes:"Mar/26", avulsa:23040, clube:18240 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const R = (v) => `R$${Number(v).toLocaleString("pt-BR", {minimumFractionDigits:0,maximumFractionDigits:0})}`;
const Rp = (v) => `R$${Number(v).toLocaleString("pt-BR", {minimumFractionDigits:2,maximumFractionDigits:2})}`;
const pct = (v,t) => t ? Math.round((v/t)*100)+"%" : "0%";

// ─── SUBCOMPONENTES ───────────────────────────────────────────────────────────
function StatCard({ label, value, trend, trendDir, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color?{color}:{}}>{value}</div>
      {sub && <div className="text-muted text-small mt-8">{sub}</div>}
      {trend && <div className={`stat-trend ${trendDir||"up"}`}>{trend}</div>}
    </div>
  );
}

function BarChart({ data }) {
  const maxVal = Math.max(...data.map(d => d.avulsa + d.clube));
  return (
    <div className="chart-wrap">
      <div className="chart-title">
        <span>Faturamento — últimos 6 meses</span>
        <span className="text-muted text-small">Avulso + Clube</span>
      </div>
      <div className="bars">
        {data.map(d => {
          const total = d.avulsa + d.clube;
          const hTotal = Math.round((total / maxVal) * 130);
          const hClube = Math.round((d.clube / total) * hTotal);
          const hAvulsa = hTotal - hClube;
          return (
            <div key={d.mes} className="bar-col">
              <div className="bar-val">{R(total)}</div>
              <div className="bar-stack" title={`${d.mes}: ${R(total)}`}>
                <div className="bar-seg" style={{height:hAvulsa, background:"#B8973A", opacity:0.75}} />
                <div className="bar-seg" style={{height:hClube,  background:"#2D6E3E", opacity:0.75}} />
              </div>
              <div className="bar-label">{d.mes}</div>
            </div>
          );
        })}
      </div>
      <div className="chart-legend">
        <div className="legend-item"><div className="legend-dot" style={{background:"#B8973A"}} />Avulso</div>
        <div className="legend-item"><div className="legend-dot" style={{background:"#2D6E3E"}} />Clube</div>
      </div>
    </div>
  );
}

// ─── ABA: DRE ────────────────────────────────────────────────────────────────
function TabDRE({ mes, dados }) {
  const desp = dados.despesas;
  const totalDesp = Object.values(desp).reduce((a,b) => a+b, 0);
  const lucro = dados.receita_total - totalDesp;
  const margem = Math.round((lucro / dados.receita_total) * 100);

  const despRows = [
    { label:"Aluguel",           val: desp.aluguel    },
    { label:"Produtos e insumos",val: desp.produtos   },
    { label:"Energia elétrica",  val: desp.energia    },
    { label:"Internet e telefone",val:desp.internet   },
    { label:"Sistema BarberFlow",val: desp.sistema    },
    { label:"Marketing",         val: desp.marketing  },
    { label:"Manutenção",        val: desp.manutencao },
    { label:"Outros",            val: desp.outros     },
  ].filter(r => r.val > 0);

  return (
    <>
      <div className="stat-grid-4 mb-16">
        <StatCard label="Receita total" value={R(dados.receita_total)} trend={`↑ +14% vs mês ant.`} />
        <StatCard label="Despesas totais" value={R(totalDesp)} color="var(--red)" trendDir="down" trend={`${pct(totalDesp,dados.receita_total)} da receita`} />
        <StatCard label="Lucro líquido" value={R(lucro)} color="var(--green)" trend={`Margem: ${margem}%`} />
        <StatCard label="Progresso da meta" value={pct(dados.receita_total,dados.meta)} color="var(--gold)" sub={`Meta: ${R(dados.meta)}`} />
      </div>

      <BarChart data={historico6m} />

      <div className="dre-wrap">
        <div className="dre-header">
          <div>
            <div className="dre-title">DRE Simplificado</div>
            <div className="dre-sub">Demonstrativo de Resultado · {mes}</div>
          </div>
          <span className="badge badge-gold">{mes}</span>
        </div>

        {/* RECEITAS */}
        <div className="dre-row section">
          <div className="dre-section-label">Receitas</div>
        </div>
        <div className="dre-row">
          <div className="dre-label dre-indent">Atendimentos avulsos</div>
          <div className="dre-bar-wrap"><div className="dre-bar-fill" style={{width:pct(dados.receita_avulsa,dados.receita_total),background:"var(--gold)"}}/></div>
          <div className="dre-pct text-muted">{pct(dados.receita_avulsa,dados.receita_total)}</div>
          <div className="dre-val text-green">{Rp(dados.receita_avulsa)}</div>
        </div>
        <div className="dre-row">
          <div className="dre-label dre-indent">Clube de assinatura</div>
          <div className="dre-bar-wrap"><div className="dre-bar-fill" style={{width:pct(dados.receita_clube,dados.receita_total),background:"var(--green)"}}/></div>
          <div className="dre-pct text-muted">{pct(dados.receita_clube,dados.receita_total)}</div>
          <div className="dre-val text-green">{Rp(dados.receita_clube)}</div>
        </div>
        <div className="dre-row total">
          <div className="dre-label">Total de receitas</div>
          <div className="dre-bar-wrap" />
          <div className="dre-pct">100%</div>
          <div className="dre-val text-green">{Rp(dados.receita_total)}</div>
        </div>

        {/* DESPESAS */}
        <div className="dre-row section">
          <div className="dre-section-label">Despesas fixas e variáveis</div>
        </div>
        {despRows.map(r => (
          <div key={r.label} className="dre-row">
            <div className="dre-label dre-indent">{r.label}</div>
            <div className="dre-bar-wrap"><div className="dre-bar-fill" style={{width:pct(r.val,dados.receita_total),background:"var(--red)",opacity:0.6}}/></div>
            <div className="dre-pct text-muted">{pct(r.val,dados.receita_total)}</div>
            <div className="dre-val text-red">({Rp(r.val)})</div>
          </div>
        ))}
        <div className="dre-row total">
          <div className="dre-label">Total de despesas</div>
          <div className="dre-bar-wrap" />
          <div className="dre-pct text-red">{pct(totalDesp,dados.receita_total)}</div>
          <div className="dre-val text-red">({Rp(totalDesp)})</div>
        </div>

        {/* RESULTADO */}
        <div className="dre-row section">
          <div className="dre-section-label">Comissões dos barbeiros</div>
        </div>
        {barbeiros.map(b => {
          const com = Math.round(b.faturamento * b.pct / 100);
          return (
            <div key={b.id} className="dre-row">
              <div className="dre-label dre-indent">{b.nome} ({b.pct}%)</div>
              <div className="dre-bar-wrap"><div className="dre-bar-fill" style={{width:pct(com,dados.receita_total),background:"var(--amb)",opacity:0.6}}/></div>
              <div className="dre-pct text-muted">{pct(com,dados.receita_total)}</div>
              <div className="dre-val text-amber">({Rp(com)})</div>
            </div>
          );
        })}
        <div className="dre-row total">
          <div className="dre-label">Total comissões</div>
          <div className="dre-bar-wrap" />
          <div className="dre-pct text-amber">{pct(barbeiros.reduce((a,b)=>a+Math.round(b.faturamento*b.pct/100),0),dados.receita_total)}</div>
          <div className="dre-val text-amber">({Rp(barbeiros.reduce((a,b)=>a+Math.round(b.faturamento*b.pct/100),0))})</div>
        </div>

        <div className="dre-row result">
          <div className="dre-label" style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:600}}>Lucro líquido do mês</div>
          <div className="dre-bar-wrap" />
          <div className="dre-pct" style={{fontWeight:600,color:"var(--green)"}}>{margem}%</div>
          <div className="dre-val" style={{fontSize:16,color:"var(--green)",fontWeight:700}}>{Rp(lucro)}</div>
        </div>
      </div>
    </>
  );
}

// ─── ABA: COMISSÕES ───────────────────────────────────────────────────────────
function TabComissoes({ dados }) {
  const [pagas, setPagas] = useState({});
  const totalFat = barbeiros.reduce((a,b)=>a+b.faturamento,0);

  return (
    <>
      <div className="stat-grid-4 mb-16">
        <StatCard label="Faturamento total" value={R(totalFat)} />
        <StatCard label="Total em comissões" value={R(barbeiros.reduce((a,b)=>a+Math.round(b.faturamento*b.pct/100),0))} color="var(--amb)" />
        <StatCard label="Comissões pagas" value={R(barbeiros.filter(b=>b.comissao_paga||pagas[b.id]).reduce((a,b)=>a+Math.round(b.faturamento*b.pct/100),0))} color="var(--green)" />
        <StatCard label="Comissões a pagar" value={R(barbeiros.filter(b=>!b.comissao_paga&&!pagas[b.id]).reduce((a,b)=>a+Math.round(b.faturamento*b.pct/100),0))} color="var(--red)" />
      </div>

      <div className="com-card">
        <div className="com-header">
          <span className="com-title">Comissões por barbeiro — Março 2026</span>
          <div className="btn-row">
            <button className="btn btn-outline" style={{fontSize:11,padding:"5px 12px",color:"rgba(255,255,255,0.6)",borderColor:"rgba(255,255,255,0.15)"}}>
              Exportar
            </button>
          </div>
        </div>
        <div className="com-row header">
          {["Barbeiro","Progresso meta","Faturamento","% Comissão","Comissão","A pagar","Status"].map(h=>(
            <div key={h} className="com-cell com-th">{h}</div>
          ))}
        </div>
        {[...barbeiros].sort((a,b)=>b.faturamento-a.faturamento).map(b => {
          const comVal = Math.round(b.faturamento * b.pct / 100);
          const progPct = Math.min(100, Math.round((b.faturamento/b.meta)*100));
          const pago = b.comissao_paga || pagas[b.id];
          return (
            <div key={b.id} className="com-row">
              <div className="com-cell">
                <div>
                  <div className="bold">{b.nome}</div>
                  <div className="text-muted text-small">{b.atendimentos} atendimentos</div>
                </div>
              </div>
              <div className="com-cell">
                <div style={{flex:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                    <span className="text-small text-muted">{R(b.faturamento)}</span>
                    <span className="text-small text-muted">{progPct}%</span>
                  </div>
                  <div className="prog-wrap">
                    <div className="prog-fill" style={{width:progPct+"%",background:progPct>=90?"var(--green)":progPct>=70?"var(--gold)":"var(--red)"}} />
                  </div>
                </div>
              </div>
              <div className="com-cell right bold">{R(b.faturamento)}</div>
              <div className="com-cell center">{b.pct}%</div>
              <div className="com-cell right bold text-amber">{R(comVal)}</div>
              <div className="com-cell right bold" style={{color:pago?"var(--green)":"var(--red)"}}>{pago ? "—" : R(comVal)}</div>
              <div className="com-cell center">
                {pago ? (
                  <span className="pago-badge pago-sim">✓ Pago</span>
                ) : (
                  <button className="btn btn-green" style={{fontSize:10,padding:"4px 10px"}}
                    onClick={()=>setPagas(p=>({...p,[b.id]:true}))}>
                    Marcar pago
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalhamento por serviço */}
      <div className="two-col">
        <div className="chart-wrap">
          <div className="chart-title">Ticket médio por barbeiro</div>
          <div className="bars" style={{height:100}}>
            {[...barbeiros].sort((a,b)=>b.ticket-a.ticket).map(b=>{
              const maxT = Math.max(...barbeiros.map(x=>x.ticket));
              const h = Math.round((b.ticket/maxT)*90);
              return (
                <div key={b.id} className="bar-col">
                  <div className="bar-val">{R(b.ticket)}</div>
                  <div className="bar-stack">
                    <div className="bar-seg" style={{height:h,background:"var(--gold)",opacity:0.8,borderRadius:4}} />
                  </div>
                  <div className="bar-label">{b.nome.split(" ")[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-wrap">
          <div className="chart-title">Ocupação da agenda</div>
          <div className="bars" style={{height:100}}>
            {[...barbeiros].sort((a,b)=>b.atendimentos-a.atendimentos).map(b=>{
              const maxA = Math.max(...barbeiros.map(x=>x.atendimentos));
              const h = Math.round((b.atendimentos/maxA)*90);
              return (
                <div key={b.id} className="bar-col">
                  <div className="bar-val">{b.atendimentos}</div>
                  <div className="bar-stack">
                    <div className="bar-seg" style={{height:h,background:"var(--blue)",opacity:0.75,borderRadius:4}} />
                  </div>
                  <div className="bar-label">{b.nome.split(" ")[0]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ABA: INADIMPLÊNCIA ───────────────────────────────────────────────────────
function TabInadimplencia() {
  const totalInad = inadimplentes.reduce((a,b)=>a+b.valor,0);

  return (
    <>
      <div className="stat-grid-4 mb-16">
        <StatCard label="Inadimplentes" value={inadimplentes.length} color="var(--red)" trend="↑ +1 vs mês ant." trendDir="down" />
        <StatCard label="Valor em risco" value={R(totalInad)} color="var(--red)" sub="/mês de receita" />
        <StatCard label="Taxa inadimplência" value="2,7%" color="var(--amb)" trend="Meta: abaixo de 3%" trendDir="neu" />
        <StatCard label="Recuperados no mês" value="R$462" color="var(--green)" trend="↑ 3 clientes" />
      </div>

      <div className="inad-alert">
        <div className="inad-icon">⚠</div>
        <div style={{flex:1}}>
          <div className="inad-title">{inadimplentes.length} assinaturas com pagamento em atraso</div>
          <div className="inad-sub">Valor total em risco: {R(totalInad)}/mês. Recomendado acionar cobrança via WhatsApp agora.</div>
        </div>
        <button className="btn btn-primary">Acionar WhatsApp para todos</button>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-head">
          <span className="tbl-head-title">Clientes inadimplentes</span>
          <div className="btn-row">
            <button className="btn btn-outline" style={{fontSize:11,padding:"5px 12px",color:"rgba(255,255,255,0.6)",borderColor:"rgba(255,255,255,0.15)"}}>
              Exportar lista
            </button>
          </div>
        </div>
        <table className="fin-table">
          <thead>
            <tr>
              <th>Cliente</th><th>Plano</th><th>Valor/mês</th><th>Dias em atraso</th><th>Tentativas</th><th>Telefone</th><th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {inadimplentes.map((c,i)=>(
              <tr key={i}>
                <td className="bold">{c.nome}</td>
                <td><span className="badge badge-gray">{c.plano}</span></td>
                <td className="bold text-red">{R(c.valor)}</td>
                <td>
                  <span style={{color:c.dias>30?"var(--red)":c.dias>15?"var(--amb)":"var(--dark)",fontWeight:600}}>
                    {c.dias} dias
                  </span>
                </td>
                <td className="text-muted">{c.tentativas}x cobrado</td>
                <td className="text-muted">{c.telefone}</td>
                <td>
                  <div className="btn-row">
                    <button className="btn btn-green" style={{fontSize:10,padding:"4px 10px"}}>WhatsApp</button>
                    <button className="btn btn-red" style={{fontSize:10,padding:"4px 10px"}}>Cancelar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Histórico de cobranças */}
      <div className="chart-wrap">
        <div className="chart-title">
          <span>Inadimplência × Recuperação — últimos 6 meses</span>
        </div>
        <div className="bars" style={{height:100}}>
          {[
            {mes:"Out",inad:1,rec:2},{mes:"Nov",inad:2,rec:1},{mes:"Dez",inad:3,rec:3},
            {mes:"Jan",inad:4,rec:2},{mes:"Fev",inad:3,rec:3},{mes:"Mar",inad:4,rec:3},
          ].map(d=>(
            <div key={d.mes} className="bar-col">
              <div className="bar-stack" style={{gap:0}}>
                <div className="bar-seg" style={{height:d.inad*20,background:"var(--red)",opacity:0.7,borderRadius:3}} />
              </div>
              <div className="bar-label">{d.mes}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── ABA: PREVISÃO ────────────────────────────────────────────────────────────
function TabPrevisao({ dados }) {
  const clubeRecorrente = 18240;
  const mediaAvulsa = Math.round((23040 + 19800 + 17200) / 3);
  const previsaoAbr = clubeRecorrente + mediaAvulsa + Math.round(mediaAvulsa * 0.08);
  const previsaoMai = Math.round(previsaoAbr * 1.06);
  const previsaoJun = Math.round(previsaoMai * 1.05);

  const cenarios = [
    { label:"Conservador (-10%)", val: Math.round(previsaoAbr * 0.90), cor:"var(--red)" },
    { label:"Esperado",           val: previsaoAbr,                    cor:"var(--gold)" },
    { label:"Otimista (+15%)",    val: Math.round(previsaoAbr * 1.15), cor:"var(--green)" },
  ];

  return (
    <>
      <div className="stat-grid-3 mb-16">
        <StatCard label="Previsão Abril" value={R(previsaoAbr)} color="var(--gold)" trend="↑ +8% vs março" sub="Base: clube + média avulso" />
        <StatCard label="Previsão Maio" value={R(previsaoMai)} color="var(--gold)" trend="↑ +6% vs abril" />
        <StatCard label="Previsão Junho" value={R(previsaoJun)} color="var(--gold)" trend="↑ +5% vs maio" />
      </div>

      <div className="two-col mb-16">
        <div className="prev-card">
          <div className="row-between mb-16">
            <span className="section-title">Previsão de Abril</span>
            <span className="badge badge-gold">próximo mês</span>
          </div>
          <div className="prev-num">{R(previsaoAbr)}</div>
          <div className="prev-desc">Estimativa baseada em receita recorrente do clube + média dos últimos 3 meses</div>
          <div className="divider" />
          <div className="prev-grid">
            <div className="prev-item">
              <div className="prev-item-label">Clube (fixo)</div>
              <div className="prev-item-val text-green">{R(clubeRecorrente)}</div>
            </div>
            <div className="prev-item">
              <div className="prev-item-label">Avulso (média)</div>
              <div className="prev-item-val text-gold">{R(mediaAvulsa)}</div>
            </div>
            <div className="prev-item">
              <div className="prev-item-label">Crescimento est.</div>
              <div className="prev-item-val text-blue">+8%</div>
            </div>
            <div className="prev-item">
              <div className="prev-item-label">Inadimplência est.</div>
              <div className="prev-item-val text-red">-{R(inadimplentes.reduce((a,b)=>a+b.valor,0))}</div>
            </div>
          </div>
        </div>

        <div className="chart-wrap" style={{marginBottom:0}}>
          <div className="chart-title">Cenários para Abril</div>
          {cenarios.map(c=>(
            <div key={c.label} style={{marginBottom:14}}>
              <div className="row-between" style={{marginBottom:5}}>
                <span className="text-small text-muted">{c.label}</span>
                <span style={{fontSize:14,fontWeight:600,color:c.cor}}>{R(c.val)}</span>
              </div>
              <div style={{height:6,background:"var(--bord)",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",background:c.cor,borderRadius:3,width:pct(c.val,previsaoAbr*1.2),opacity:0.8}} />
              </div>
            </div>
          ))}
          <div className="divider" />
          <div style={{fontSize:11,color:"var(--muted)",lineHeight:1.6}}>
            <strong>Alavancas para bater o cenário otimista:</strong><br/>
            ↑ Converter 5 avulsos em assinantes do clube<br/>
            ↑ Reduzir inadimplência para 1,5%<br/>
            ↑ Aumentar ticket médio com extras (+R$20/visita)
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        <div className="chart-title">
          <span>Projeção 6 meses</span>
          <span className="text-small text-muted">Cenário esperado</span>
        </div>
        <div className="bars" style={{height:120}}>
          {[
            {mes:"Jan",val:33600,real:true},{mes:"Fev",val:36180,real:true},{mes:"Mar",val:41280,real:true},
            {mes:"Abr",val:previsaoAbr,real:false},{mes:"Mai",val:previsaoMai,real:false},{mes:"Jun",val:previsaoJun,real:false},
          ].map(d=>{
            const maxV = previsaoJun;
            const h = Math.round((d.val/maxV)*110);
            return (
              <div key={d.mes} className="bar-col">
                <div className="bar-val" style={{color:d.real?"var(--dark)":"var(--gold)"}}>{R(d.val)}</div>
                <div className="bar-stack">
                  <div className="bar-seg" style={{height:h,background:d.real?"var(--dark)":"var(--gold)",opacity:d.real?0.7:0.5,borderRadius:"4px 4px 0 0",border:d.real?"none":"2px dashed var(--gold)"}} />
                </div>
                <div className="bar-label" style={{color:d.real?"var(--muted)":"var(--gold)"}}>{d.mes}{!d.real?" *":""}</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11,color:"var(--muted)",marginTop:8}}>* Projeção estimada</div>
      </div>
    </>
  );
}

// ─── MODAL EXPORTAR ───────────────────────────────────────────────────────────
function ModalExportar({ onClose }) {
  const [selecionado, setSelecionado] = useState("pdf_dre");
  const [periodo, setPeriodo] = useState("Mar/2026");

  const opcoes = [
    { key:"pdf_dre",     icon:"📄", nome:"DRE em PDF",            desc:"Demonstrativo completo do mês formatado para impressão" },
    { key:"pdf_com",     icon:"💰", nome:"Relatório de comissões", desc:"Detalhamento por barbeiro, pronto para assinatura" },
    { key:"pdf_inad",    icon:"⚠️", nome:"Lista de inadimplentes", desc:"Relatório de cobranças em atraso com contatos" },
    { key:"pdf_prev",    icon:"📈", nome:"Relatório de previsão",  desc:"Projeções dos próximos 3 meses com cenários" },
    { key:"pdf_compl",   icon:"📊", nome:"Relatório completo",     desc:"Todos os módulos financeiros em um único PDF" },
  ];

  const handleExportar = () => {
    // Simulação — em produção chama a API de geração de PDF
    alert(`Gerando ${opcoes.find(o=>o.key===selecionado)?.nome} — ${periodo}\n\nEm produção, isso gera o PDF via jsPDF ou Puppeteer no backend.`);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-title">Exportar relatório</div>
        <div className="form-group">
          <label className="form-label">Período</label>
          <select className="form-select" value={periodo} onChange={e=>setPeriodo(e.target.value)}>
            {["Mar/2026","Fev/2026","Jan/2026","Dez/2025","Nov/2025","Out/2025"].map(m=>(
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tipo de relatório</label>
          {opcoes.map(o=>(
            <div key={o.key} className={`export-opt ${selecionado===o.key?"selected":""}`} onClick={()=>setSelecionado(o.key)}>
              <div className="export-icon">{o.icon}</div>
              <div>
                <div className="export-name">{o.nome}</div>
                <div className="export-desc">{o.desc}</div>
              </div>
              {selecionado===o.key && <span style={{marginLeft:"auto",color:"var(--gold)",fontSize:18}}>✓</span>}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleExportar}>📥 Gerar PDF</button>
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function PageFinanceiro() {
  const [aba, setAba] = useState("dre");
  const [mesIdx, setMesIdx] = useState(0); // 0=Mar/2026
  const [modalExport, setModalExport] = useState(false);

  const mesesDisp = Object.keys(dadosMensais);
  const mesAtual = mesesDisp[mesIdx];
  const dados = dadosMensais[mesAtual];

  const abas = [
    { key:"dre",       label:"DRE Mensal"    },
    { key:"comissoes", label:"Comissões"     },
    { key:"inad",      label:"Inadimplência" },
    { key:"previsao",  label:"Previsão"      },
  ];

  return (
    <div className="fin">
      <style>{css}</style>

      <div className="fin-topbar">
        <div>
          <div className="fin-heading">Financeiro</div>
          <div className="fin-sub">Gestão financeira e relatórios</div>
        </div>
        <div className="btn-row" style={{alignItems:"center",gap:12}}>
          <div className="month-sel">
            <button className="month-btn" onClick={()=>setMesIdx(i=>Math.min(i+1,mesesDisp.length-1))}>‹</button>
            <span className="month-label">{mesAtual}</span>
            <button className="month-btn" onClick={()=>setMesIdx(i=>Math.max(i-1,0))}>›</button>
          </div>
          <button className="btn btn-primary" onClick={()=>setModalExport(true)}>📥 Exportar PDF</button>
        </div>
      </div>

      <div className="fin-content">
        <div className="tab-bar">
          {abas.map(a=>(
            <button key={a.key} className={`tab-btn ${aba===a.key?"active":""}`} onClick={()=>setAba(a.key)}>
              {a.label}
            </button>
          ))}
        </div>

        {aba==="dre"       && <TabDRE mes={mesAtual} dados={dados} />}
        {aba==="comissoes" && <TabComissoes dados={dados} />}
        {aba==="inad"      && <TabInadimplencia />}
        {aba==="previsao"  && <TabPrevisao dados={dados} />}
      </div>

      {modalExport && <ModalExportar onClose={()=>setModalExport(false)} />}
    </div>
  );
}
