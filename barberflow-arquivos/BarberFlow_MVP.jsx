import { useState } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gold: #B8973A;
    --gold-light: #D4AF5A;
    --gold-pale: #FAF0D4;
    --dark: #1A1610;
    --dark-2: #252018;
    --surface: #FAFAF8;
    --white: #FFFFFF;
    --text: #1A1610;
    --muted: #7A7060;
    --faint: #B4AFA5;
    --border: #E8E2D4;
    --border-strong: #C8C0B0;
    --green: #2D6E3E;
    --green-bg: #EAF4ED;
    --red: #A32D2D;
    --red-bg: #FCEBEB;
    --amber: #854F0B;
    --amber-bg: #FAEEDA;
    --blue: #185FA5;
    --blue-bg: #E6F1FB;
    --shadow-sm: 0 1px 3px rgba(26,22,16,0.06), 0 1px 2px rgba(26,22,16,0.04);
    --shadow-md: 0 4px 12px rgba(26,22,16,0.08), 0 2px 4px rgba(26,22,16,0.04);
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  .app { display: flex; height: 100vh; overflow: hidden; }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 228px; min-width: 228px;
    background: var(--dark);
    display: flex; flex-direction: column;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .sidebar-logo {
    padding: 24px 20px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }
  .logo-mark {
    display: flex; align-items: center; gap: 10px; margin-bottom: 2px;
  }
  .logo-icon {
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--gold); display: flex; align-items: center;
    justify-content: center; font-size: 14px; color: var(--dark); font-weight: 700;
    font-family: 'Playfair Display', serif;
  }
  .logo-name {
    font-family: 'Playfair Display', serif;
    color: var(--gold-light); font-size: 14px; font-weight: 600; letter-spacing: 0.3px;
  }
  .logo-tagline { font-size: 10px; color: rgba(255,255,255,0.28); letter-spacing: 1.8px; text-transform: uppercase; margin-left: 42px; }

  .nav { flex: 1; padding: 14px 0; overflow-y: auto; }
  .nav-section {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,0.22); padding: 10px 20px 5px;
  }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 20px; cursor: pointer;
    font-size: 13px; color: rgba(255,255,255,0.5);
    border-left: 2px solid transparent;
    transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { color: rgba(255,255,255,0.82); background: rgba(255,255,255,0.04); }
  .nav-item.active { color: var(--gold-light); border-left-color: var(--gold); background: rgba(184,151,58,0.1); }
  .nav-icon { width: 18px; text-align: center; font-size: 15px; }
  .nav-badge {
    margin-left: auto; background: var(--red); color: #fff;
    font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600;
  }

  .sidebar-user {
    padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 10px;
  }
  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--gold); color: var(--dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; flex-shrink: 0;
  }
  .user-name { font-size: 12px; color: rgba(255,255,255,0.75); font-weight: 500; }
  .user-role { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px; }

  /* ── MAIN ── */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .topbar {
    background: var(--white); border-bottom: 1px solid var(--border);
    padding: 14px 28px; display: flex; align-items: center;
    justify-content: space-between; flex-shrink: 0;
    box-shadow: var(--shadow-sm);
  }
  .page-heading { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; }
  .page-sub { font-size: 12px; color: var(--muted); margin-top: 1px; }
  .topbar-right { display: flex; align-items: center; gap: 10px; }

  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: var(--radius-sm);
    font-size: 12px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; border: none; font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
  }
  .btn-primary { background: var(--gold); color: var(--dark); }
  .btn-primary:hover { background: var(--gold-light); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
  .btn-outline:hover { background: var(--surface); border-color: var(--border-strong); }
  .btn-ghost { background: transparent; color: var(--muted); }
  .btn-ghost:hover { background: var(--surface); color: var(--text); }
  .btn-danger { background: var(--red-bg); color: var(--red); border: 1px solid #F09595; }

  /* ── CONTENT ── */
  .content { flex: 1; overflow-y: auto; padding: 24px 28px; }

  /* ── BADGES ── */
  .badge {
    display: inline-flex; align-items: center;
    padding: 3px 9px; border-radius: 20px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.2px;
    white-space: nowrap;
  }
  .badge-gold { background: var(--gold-pale); color: var(--amber); }
  .badge-green { background: var(--green-bg); color: var(--green); }
  .badge-red { background: var(--red-bg); color: var(--red); }
  .badge-blue { background: var(--blue-bg); color: var(--blue); }
  .badge-gray { background: #F1EFE8; color: #5F5E5A; }
  .badge-dark { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.75); }

  /* ── CARDS ── */
  .card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px;
    box-shadow: var(--shadow-sm);
  }
  .card-title {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1px; color: var(--muted); margin-bottom: 14px;
  }

  /* ── STAT CARDS ── */
  .stat-grid { display: grid; gap: 12px; }
  .stat-grid-4 { grid-template-columns: repeat(4, 1fr); }
  .stat-grid-3 { grid-template-columns: repeat(3, 1fr); }
  .stat-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .stat-card { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; }
  .stat-label { font-size: 11px; color: var(--muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 600; margin-top: 4px; line-height: 1; }
  .stat-trend { font-size: 11px; margin-top: 6px; display: flex; align-items: center; gap: 3px; }
  .trend-up { color: var(--green); }
  .trend-down { color: var(--red); }
  .trend-neutral { color: var(--muted); }

  /* ── TABLE ── */
  .table-wrap { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  thead th {
    background: var(--surface); padding: 10px 16px;
    text-align: left; font-size: 10px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  tbody td { padding: 11px 16px; border-bottom: 1px solid var(--border); font-size: 13px; }
  tbody tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: #FAF9F6; cursor: pointer; }

  /* ── PROGRESS ── */
  .progress { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .progress-gold { background: var(--gold); }
  .progress-green { background: var(--green); }
  .progress-amber { background: #EF9F27; }
  .progress-red { background: var(--red); }

  /* ── AVATAR ── */
  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .avatar-gold { background: var(--gold-pale); color: var(--amber); border: 1px solid #D4AF5A; }
  .avatar-gray { background: #F1EFE8; color: var(--muted); border: 1px solid var(--border); }
  .avatar-lg { width: 52px; height: 52px; font-size: 18px; font-family: 'Playfair Display', serif; }

  /* ── AI SUGGESTION BOX ── */
  .ai-box {
    background: var(--dark-2); border: 1px solid rgba(184,151,58,0.3);
    border-radius: var(--radius-md); padding: 14px 16px;
    display: flex; gap: 12px; align-items: flex-start;
  }
  .ai-dot {
    width: 28px; height: 28px; border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-light));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; flex-shrink: 0; color: var(--dark); font-weight: 700;
  }
  .ai-label { font-size: 9px; color: var(--gold-light); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 3px; }
  .ai-text { font-size: 12px; color: rgba(255,255,255,0.78); line-height: 1.55; }

  /* ── FORM ── */
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 6px; }
  .form-input, .form-select {
    width: 100%; padding: 9px 12px;
    border: 1px solid var(--border); border-radius: var(--radius-sm);
    font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--text); background: var(--white); outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus, .form-select:focus { border-color: var(--gold); }
  .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* ── MODAL ── */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(26,22,16,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
  }
  .modal {
    background: var(--white); border-radius: var(--radius-lg);
    padding: 26px; width: 440px; max-width: 100%;
    box-shadow: 0 20px 60px rgba(26,22,16,0.2);
    animation: modalIn 0.2s ease;
  }
  @keyframes modalIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: none; } }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; margin-bottom: 20px; }
  .modal-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 22px; }

  /* ── AGENDA ── */
  .agenda-layout { display: grid; grid-template-columns: 1fr 290px; gap: 20px; }
  .cal-toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .cal-nav { display: flex; align-items: center; gap: 8px; }
  .cal-nav-btn {
    width: 28px; height: 28px; border-radius: 6px;
    border: 1px solid var(--border); background: var(--white);
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: var(--muted); transition: all 0.15s;
  }
  .cal-nav-btn:hover { border-color: var(--border-strong); color: var(--text); }
  .cal-month { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; }
  .day-pills { display: flex; gap: 4px; }
  .day-pill {
    padding: 5px 11px; border-radius: 20px; font-size: 11px; font-weight: 500;
    cursor: pointer; border: 1px solid var(--border); background: var(--white);
    color: var(--muted); transition: all 0.15s;
  }
  .day-pill.active { background: var(--dark); color: #fff; border-color: var(--dark); }
  .day-pill:hover:not(.active) { border-color: var(--border-strong); color: var(--text); }

  .schedule-grid {
    display: grid; grid-template-columns: 54px repeat(4, 1fr);
    border: 1px solid var(--border); border-radius: var(--radius-md);
    overflow: hidden; background: var(--white);
  }
  .sg-header { background: var(--dark); padding: 11px 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.06); }
  .sg-header:last-child { border-right: none; }
  .sg-barber { font-size: 11px; color: rgba(255,255,255,0.72); font-weight: 500; }
  .sg-slots { font-size: 9px; color: rgba(255,255,255,0.32); margin-top: 2px; }
  .sg-time { font-size: 10px; color: var(--muted); padding: 0 8px; display: flex; align-items: center; justify-content: flex-end; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); height: 58px; }
  .sg-cell { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); height: 58px; padding: 3px; cursor: pointer; transition: background 0.1s; }
  .sg-cell:last-child { border-right: none; }
  .sg-cell.empty:hover { background: #FAF9F6; }
  .sg-cell.empty:hover::after { content: "+"; display: flex; align-items: center; justify-content: center; height: 100%; color: var(--faint); font-size: 18px; }
  .appt {
    height: 100%; border-radius: 5px; padding: 5px 7px;
    overflow: hidden; cursor: pointer;
  }
  .appt-gold { background: var(--gold-pale); border-left: 3px solid var(--gold); }
  .appt-green { background: var(--green-bg); border-left: 3px solid var(--green); }
  .appt-blue { background: var(--blue-bg); border-left: 3px solid var(--blue); }
  .appt-name { font-size: 10px; font-weight: 600; color: var(--text); }
  .appt-svc { font-size: 9px; color: var(--muted); margin-top: 1px; }

  /* ── CRM ── */
  .crm-layout { display: grid; grid-template-columns: 255px 1fr; gap: 18px; }
  .client-list-wrap { background: var(--white); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .client-search-wrap { padding: 12px; border-bottom: 1px solid var(--border); }
  .client-search { width: 100%; padding: 7px 11px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; font-family: 'DM Sans', sans-serif; outline: none; color: var(--text); }
  .client-search:focus { border-color: var(--gold); }
  .client-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-bottom: 1px solid var(--border);
    cursor: pointer; transition: background 0.1s; border-left: 3px solid transparent;
  }
  .client-row:last-child { border-bottom: none; }
  .client-row:hover { background: #FAF9F6; }
  .client-row.active { background: #FAF9F6; border-left-color: var(--gold); }
  .client-row-name { font-size: 13px; font-weight: 500; }
  .client-row-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }

  .crm-detail-wrap { display: flex; flex-direction: column; gap: 14px; }
  .crm-header-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 20px;
    display: flex; align-items: flex-start; gap: 16px;
  }
  .crm-name { font-family: 'Playfair Display', serif; font-size: 21px; font-weight: 600; }
  .crm-contact { font-size: 12px; color: var(--muted); margin-top: 4px; }
  .crm-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }

  .pref-tag { padding: 5px 11px; border-radius: 20px; font-size: 11px; background: var(--surface); border: 1px solid var(--border); color: var(--text); white-space: nowrap; }
  .pref-tag-gold { background: var(--gold-pale); border-color: #D4AF5A; color: var(--amber); }

  .timeline-item { display: flex; gap: 12px; padding: 9px 0; border-bottom: 1px solid var(--border); }
  .timeline-item:last-child { border-bottom: none; }
  .timeline-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 5px; }
  .timeline-dot-gray { background: var(--border-strong); }
  .timeline-date { font-size: 11px; color: var(--muted); min-width: 80px; flex-shrink: 0; }
  .timeline-desc { font-size: 13px; }
  .timeline-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── DASHBOARD ── */
  .ranking-row {
    display: flex; align-items: center; gap: 12px;
    padding: 11px 16px; border-bottom: 1px solid var(--border);
    transition: background 0.1s; cursor: pointer;
  }
  .ranking-row:last-child { border-bottom: none; }
  .ranking-row:hover { background: #FAF9F6; }
  .rank-num { width: 20px; font-size: 11px; font-weight: 600; color: var(--muted); flex-shrink: 0; }
  .rank-num.gold { color: var(--gold); }
  .ranking-meta { flex: 1; }
  .ranking-name { font-size: 13px; font-weight: 500; }
  .ranking-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .ranking-kpis { display: flex; gap: 18px; }
  .kpi { text-align: right; }
  .kpi-val { font-size: 13px; font-weight: 600; }
  .kpi-label { font-size: 9px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── ALERT ITEM ── */
  .alert-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .alert-item:last-child { border-bottom: none; }
  .alert-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .alert-text { font-size: 12px; line-height: 1.45; }
  .alert-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── CLUB ── */
  .plans-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 18px; }
  .plan-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 16px; text-align: center;
    cursor: pointer; transition: all 0.15s;
  }
  .plan-card:hover { border-color: var(--gold-light); }
  .plan-card.featured { border: 2px solid var(--gold); background: #FEFCF5; }
  .plan-name { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; }
  .plan-price { font-size: 24px; font-weight: 300; color: var(--gold); margin: 8px 0 4px; line-height: 1; }
  .plan-price span { font-size: 11px; color: var(--muted); font-weight: 400; }
  .plan-feature { font-size: 11px; color: var(--muted); line-height: 1.7; margin-top: 6px; }
  .plan-count { font-size: 22px; font-weight: 600; margin-top: 10px; }
  .plan-count-label { font-size: 10px; color: var(--muted); }

  .churn-alert {
    background: var(--amber-bg); border: 1px solid #EF9F27;
    border-radius: var(--radius-md); padding: 13px 16px;
    display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
  }
  .churn-icon { font-size: 18px; flex-shrink: 0; }
  .churn-title { font-size: 13px; font-weight: 600; color: var(--amber); }
  .churn-sub { font-size: 11px; color: #854F0B; margin-top: 2px; }

  /* ── WAIT LIST ── */
  .wait-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
  .wait-item:last-child { border-bottom: none; }
  .wait-name { font-size: 12px; font-weight: 500; }
  .wait-svc { font-size: 11px; color: var(--muted); }
  .wait-time { font-size: 11px; color: var(--amber); margin-left: auto; margin-right: 8px; white-space: nowrap; }
  .notify-btn {
    width: 24px; height: 24px; border-radius: 50%;
    background: var(--green-bg); border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; color: var(--green); flex-shrink: 0;
    transition: background 0.15s;
  }
  .notify-btn:hover { background: #C0DD97; }

  /* ── MISC ── */
  .section-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .section-title { font-size: 13px; font-weight: 600; }
  .divider { height: 1px; background: var(--border); margin: 16px 0; }
  .row { display: flex; gap: 10px; }
  .row-between { display: flex; align-items: center; justify-content: space-between; }
  .mt-4 { margin-top: 4px; }
  .mt-8 { margin-top: 8px; }
  .mt-12 { margin-top: 12px; }
  .mt-16 { margin-top: 16px; }
  .mb-12 { margin-bottom: 12px; }
  .mb-16 { margin-bottom: 16px; }
  .gap-12 { gap: 12px; }
  .gap-16 { gap: 16px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .side-stack { display: flex; flex-direction: column; gap: 14px; }
  .bold { font-weight: 600; }
  .text-muted { color: var(--muted); }
  .text-small { font-size: 11px; }
  .text-gold { color: var(--gold); }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-amber { color: var(--amber); }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const barbeiros = [
  { id: 1, nome: "Rafael M.", atendimentos: 6, meta: 12000, faturamento: 11200, ticket: 123, retencao: 91, clubes: 5 },
  { id: 2, nome: "Thiago S.", atendimentos: 5, meta: 12000, faturamento: 9800, ticket: 117, retencao: 82, clubes: 2 },
  { id: 3, nome: "Bruno K.", atendimentos: 7, meta: 13000, faturamento: 12400, ticket: 127, retencao: 94, clubes: 3 },
  { id: 4, nome: "Lucas P.", atendimentos: 4, meta: 12000, faturamento: 7880, ticket: 109, retencao: 74, clubes: 2 },
];

const clientes = [
  {
    id: 1, iniciais: "CF", nome: "Carlos Ferreira", plano: "Clube Black", planoKey: "black",
    telefone: "(41) 99876-5432", email: "carlos.f@email.com", aniversario: "15 de abril",
    visitas: 47, ticket: 312, frequencia: "8/mês", nps: 9.8, desde: "Mar/2024", diasAtras: 5,
    corte: ["Fade médio", "Lateral fechada", "Topo texturizado"],
    barba: ["Degradê na barba", "Contorno reto", "Hidratante barba"],
    extras: ["Terapia facial", "Sobrancelha", "Skincare luxo"],
    obs: "Prefere Rafael. Gosta de papo sobre futebol. Alérgico a mentol. Sempre aceita skincare. Aniversário em abril — gift card.",
    historico: [
      { data: "26 Mar 2026", svc: "Corte Fade + Barba + Skincare Luxo", barb: "Rafael M.", valor: 320, avaliacao: 5 },
      { data: "19 Mar 2026", svc: "Barba modelada + Sobrancelha", barb: "Rafael M.", valor: 180 },
      { data: "12 Mar 2026", svc: "Corte completo + Terapia facial", barb: "Rafael M.", valor: 290, indicou: "Pedro R." },
      { data: "05 Mar 2026", svc: "Barba + Hidratação capilar", barb: "Rafael M.", valor: 220 },
    ],
  },
  {
    id: 2, iniciais: "JV", nome: "João Vieira", plano: "Combo", planoKey: "combo",
    telefone: "(41) 98765-4321", email: "joao.v@email.com", aniversario: "3 de julho",
    visitas: 31, ticket: 195, frequencia: "6/mês", nps: 9.1, desde: "Jan/2025", diasAtras: 3,
    corte: ["Degradê baixo", "Franja longa"], barba: ["Natural", "Óleo de barba"],
    extras: ["Sobrancelha"], obs: "Veio 6x este mês — candidato a upgrade para Clube Black.",
    historico: [
      { data: "28 Mar 2026", svc: "Corte + Barba luxo", barb: "Bruno K.", valor: 200 },
      { data: "21 Mar 2026", svc: "Corte premium", barb: "Bruno K.", valor: 140 },
    ],
  },
  {
    id: 3, iniciais: "FM", nome: "Felipe Martins", plano: "Clube Black", planoKey: "black",
    telefone: "(41) 97654-3210", email: "felipe.m@email.com", aniversario: "22 de outubro",
    visitas: 39, ticket: 280, frequencia: "5/mês", nps: 9.4, desde: "Ago/2024", diasAtras: 8,
    corte: ["Undercut", "Franja caída"], barba: ["Cavanhaque definido"],
    extras: ["Skincare facial"], obs: "Pontual. Prefere horários matutinos. Indicou 3 amigos.",
    historico: [
      { data: "23 Mar 2026", svc: "Corte + Skincare facial", barb: "Thiago S.", valor: 290 },
      { data: "14 Mar 2026", svc: "Corte completo", barb: "Thiago S.", valor: 150 },
    ],
  },
  {
    id: 4, iniciais: "RL", nome: "Roberto Lima", plano: "Corte", planoKey: "corte",
    telefone: "(41) 96543-2109", email: "roberto.l@email.com", aniversario: "8 de dezembro",
    visitas: 9, ticket: 80, frequencia: "1/mês", nps: 7.5, desde: "Jun/2025", diasAtras: 28,
    corte: ["Clássico", "Lateral curta"], barba: [], extras: [],
    obs: "Sem visita há 28 dias. Score de churn alto. Recomendado contato ativo.",
    historico: [
      { data: "03 Mar 2026", svc: "Corte clássico", barb: "Lucas P.", valor: 80 },
    ],
  },
];

const agendamentos = [
  { barb: 0, hora: "08:00", cliente: "Carlos F.", svc: "Corte + Barba", tipo: "gold", plano: "Black" },
  { barb: 2, hora: "08:00", cliente: "Marcos A.", svc: "Corte Premium", tipo: "green" },
  { barb: 1, hora: "09:00", cliente: "João V.", svc: "Barba Luxo", tipo: "gold", plano: "Clube" },
  { barb: 2, hora: "09:00", cliente: "André L.", svc: "Hidratação", tipo: "blue" },
  { barb: 0, hora: "10:00", cliente: "Pedro R.", svc: "Fade + Sobrancelha", tipo: "blue" },
  { barb: 3, hora: "10:00", cliente: "Felipe M.", svc: "Corte Clássico", tipo: "gold", plano: "Black" },
  { barb: 1, hora: "11:00", cliente: "Rodrigo C.", svc: "Corte + Barba", tipo: "green" },
  { barb: 2, hora: "11:00", cliente: "Lucas B.", svc: "Skincare + Corte", tipo: "gold", plano: "Black" },
  { barb: 0, hora: "13:00", cliente: "Gabriel N.", svc: "Corte Juvenil", tipo: "green" },
  { barb: 2, hora: "13:00", cliente: "Henrique S.", svc: "Barba Modelada", tipo: "blue" },
  { barb: 3, hora: "13:00", cliente: "Victor A.", svc: "Corte + Barba", tipo: "gold", plano: "Clube" },
];

const horasGrid = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"];

const listaEspera = [
  { iniciais: "WF", nome: "William F.", svc: "Corte + Barba", barb: "Rafael M.", tempo: "~20min" },
  { iniciais: "DM", nome: "Daniel M.", svc: "Fade", barb: "Qualquer", tempo: "~45min" },
  { iniciais: "RS", nome: "Rafael S.", svc: "Barba", barb: "Bruno K.", tempo: "~60min" },
];

const planos = [
  { nome: "Corte", preco: 89, membros: 38, features: "4 cortes/mês\n1 barbeiro fixo\nPrioridade agenda" },
  { nome: "Barba", preco: 69, membros: 22, features: "Barba ilimitada\nProdutos exclusivos\nPrioridade agenda" },
  { nome: "Combo", preco: 139, membros: 51, features: "4 cortes + barba ilim.\nSkincare mensal\nDesconto extras 10%" },
  { nome: "Clube Black", preco: 249, membros: 36, features: "Ilimitado tudo\nPrioritário 24h\nEventos networking\nSkincare + extras", featured: true },
];

const membrosClube = [
  { nome: "João Vieira", plano: "Combo", badge: "badge-gray", desde: "Jan 2025", uso: 6, max: 4, score: "upgrade", scoreLabel: "★ Upgrade", status: "badge-green", statusLabel: "Ativo" },
  { nome: "Carlos Ferreira", plano: "Clube Black", badge: "badge-gold", desde: "Mar 2024", uso: 8, max: null, score: "alto", scoreLabel: "● Alto", status: "badge-green", statusLabel: "Ativo" },
  { nome: "Roberto Lima", plano: "Corte", badge: "badge-gray", desde: "Jun 2025", uso: 1, max: 4, score: "risco", scoreLabel: "● Risco", status: "badge-red", statusLabel: "Alerta" },
  { nome: "Felipe Martins", plano: "Clube Black", badge: "badge-gold", desde: "Ago 2024", uso: 5, max: null, score: "alto", scoreLabel: "● Alto", status: "badge-green", statusLabel: "Ativo" },
  { nome: "André Costa", plano: "Barba", badge: "badge-gray", desde: "Nov 2025", uso: 0, max: null, score: "churn", scoreLabel: "● Churn", status: "badge-red", statusLabel: "Alerta" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Badge({ tipo, children }) {
  return <span className={`badge badge-${tipo}`}>{children}</span>;
}

function StatCard({ label, value, trend, trendDir, color }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      {trend && <div className={`stat-trend trend-${trendDir || "up"}`}>{trend}</div>}
    </div>
  );
}

function ProgressBar({ pct, color = "gold" }) {
  return (
    <div className="progress mt-4">
      <div className={`progress-fill progress-${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

function AIBox({ text }) {
  return (
    <div className="ai-box">
      <div className="ai-dot">✦</div>
      <div>
        <div className="ai-label">Sugestão IA</div>
        <div className="ai-text">{text}</div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function NovoAgendamentoModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Novo agendamento</div>
        <div className="form-group">
          <label className="form-label">Cliente</label>
          <input className="form-input" placeholder="Buscar cliente ou cadastrar novo..." />
        </div>
        <div className="form-group">
          <label className="form-label">Serviço</label>
          <select className="form-select">
            <option>Corte clássico · 45min · R$60</option>
            <option>Fade premium · 60min · R$80</option>
            <option>Barba luxo · 30min · R$50</option>
            <option>Corte + Barba · 75min · R$120</option>
            <option>Skincare facial · 45min · R$90</option>
            <option>Combo Black · 90min · R$180</option>
          </select>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Barbeiro</label>
            <select className="form-select">
              <option>Rafael M.</option>
              <option>Thiago S.</option>
              <option>Bruno K.</option>
              <option>Lucas P.</option>
              <option>✦ Melhor disponível (IA)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Horário</label>
            <select className="form-select">
              <option>10:00</option><option>10:30</option><option>14:00</option>
              <option>14:30</option><option>15:00</option><option>16:00</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Lembrete WhatsApp</label>
          <select className="form-select">
            <option>Enviar 1h antes (recomendado)</option>
            <option>Enviar no dia anterior</option>
            <option>Não enviar</option>
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={onClose}>Confirmar agendamento</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: AGENDA ─────────────────────────────────────────────────────────────
function PageAgenda() {
  const [modal, setModal] = useState(false);
  const [diaAtivo, setDiaAtivo] = useState("Ter");
  const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getAppt = (barbIdx, hora) =>
    agendamentos.find(a => a.barb === barbIdx && a.hora === hora);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Agenda inteligente</div>
          <div className="page-sub">Terça-feira, 31 de março de 2026</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-outline">Filtrar</button>
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Novo agendamento</button>
        </div>
      </div>

      <div className="content">
        <div className="agenda-layout">
          {/* GRADE */}
          <div>
            <div className="cal-toolbar">
              <div className="cal-nav">
                <button className="cal-nav-btn">‹</button>
                <span className="cal-month">Março 2026</span>
                <button className="cal-nav-btn">›</button>
              </div>
              <div className="day-pills">
                {dias.map(d => (
                  <button key={d} className={`day-pill ${diaAtivo === d ? "active" : ""}`} onClick={() => setDiaAtivo(d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="schedule-grid">
              <div className="sg-header" />
              {barbeiros.map(b => (
                <div key={b.id} className="sg-header">
                  <div className="sg-barber">{b.nome}</div>
                  <div className="sg-slots">{b.atendimentos} hoje</div>
                </div>
              ))}
              {horasGrid.map(hora => (
                <>
                  <div key={`t-${hora}`} className="sg-time">{hora}</div>
                  {barbeiros.map((b, bi) => {
                    const appt = getAppt(bi, hora);
                    const isAlmoco = hora === "12:00";
                    return (
                      <div key={`c-${bi}-${hora}`} className={`sg-cell ${!appt ? "empty" : ""}`} style={isAlmoco ? { background: "#FAFAF8" } : {}}>
                        {appt && (
                          <div className={`appt appt-${appt.tipo}`}>
                            <div className="appt-name">{appt.cliente}</div>
                            <div className="appt-svc">{appt.svc}</div>
                            {appt.plano && <span className="badge badge-gold" style={{ marginTop: 3, fontSize: 8 }}>{appt.plano}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* LADO DIREITO */}
          <div className="side-stack">
            <AIBox text="João Vieira veio 6x este mês. Recomendar upgrade para Clube Black no próximo atendimento." />

            <div className="card">
              <div className="card-title">Resumo do dia</div>
              {[
                { label: "Confirmados", val: "18", color: "" },
                { label: "Pendentes", val: "3", color: "var(--amber)" },
                { label: "Disponíveis", val: "7", color: "var(--green)" },
                { label: "Faturamento prev.", val: "R$ 2.840", color: "" },
                { label: "No-shows hoje", val: "1", color: "var(--red)" },
              ].map(r => (
                <div key={r.label} className="row-between" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-muted text-small">{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: r.color || "var(--text)" }}>{r.val}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-row">
                <div className="card-title" style={{ marginBottom: 0 }}>Lista de espera</div>
                <Badge tipo="gray">3 aguardando</Badge>
              </div>
              {listaEspera.map(w => (
                <div key={w.nome} className="wait-item">
                  <div className="avatar avatar-gray">{w.iniciais}</div>
                  <div style={{ flex: 1 }}>
                    <div className="wait-name">{w.nome}</div>
                    <div className="wait-svc">{w.svc} · {w.barb}</div>
                  </div>
                  <span className="wait-time">{w.tempo}</span>
                  <button className="notify-btn" title="Notificar via WhatsApp">✓</button>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Lembretes WhatsApp</div>
              {[
                { label: "Enviados hoje", val: "14 ✓", color: "var(--green)" },
                { label: "Confirmados", val: "11/14", color: "" },
                { label: "Sem resposta", val: "3", color: "var(--amber)" },
              ].map(r => (
                <div key={r.label} className="row-between" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                  <span className="text-muted text-small">{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: r.color || "var(--text)" }}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && <NovoAgendamentoModal onClose={() => setModal(false)} />}
    </>
  );
}

// ─── PAGE: CLUBE ──────────────────────────────────────────────────────────────
function PageClube() {
  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Clube de assinatura</div>
          <div className="page-sub">Gestão de planos recorrentes</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary">+ Novo membro</button>
        </div>
      </div>

      <div className="content">
        <div className="stat-grid stat-grid-4 mb-16">
          <StatCard label="Total de membros" value="147" trend="↑ +12 este mês" />
          <StatCard label="Receita recorrente" value="R$18.240" trend="↑ +8,3%" />
          <StatCard label="Churn rate" value="2,1%" trend="↓ melhorou" trendDir="up" color="var(--red)" />
          <StatCard label="Ticket médio" value="R$124" trend="↑ +R$9" />
        </div>

        <div className="churn-alert">
          <span className="churn-icon">⚠</span>
          <div style={{ flex: 1 }}>
            <div className="churn-title">3 clientes com risco de churn</div>
            <div className="churn-sub">Sem visita há mais de 35 dias. Recomendado contato ativo via WhatsApp.</div>
          </div>
          <button className="btn btn-outline">Acionar campanha</button>
        </div>

        <div className="plans-grid mb-16">
          {planos.map(p => (
            <div key={p.nome} className={`plan-card ${p.featured ? "featured" : ""}`}>
              {p.featured && <div style={{ fontSize: 9, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>★ Premium</div>}
              <div className="plan-name">{p.nome}</div>
              <div className="plan-price">R${p.preco}<span>/mês</span></div>
              <div className="plan-feature" style={{ whiteSpace: "pre-line" }}>{p.features}</div>
              <div className="plan-count" style={{ color: p.featured ? "var(--gold)" : "var(--text)" }}>{p.membros}</div>
              <div className="plan-count-label">membros ativos</div>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th><th>Plano</th><th>Desde</th><th>Uso do mês</th><th>Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {membrosClube.map(m => {
                const pct = m.max ? (m.uso / m.max) * 100 : (m.uso / 8) * 100;
                const barColor = m.score === "churn" || m.score === "risco" ? "red" : m.score === "upgrade" ? "gold" : "green";
                const scoreColor = m.score === "upgrade" ? "var(--gold)" : m.score === "alto" ? "var(--green)" : "var(--red)";
                return (
                  <tr key={m.nome}>
                    <td><span className="bold">{m.nome}</span></td>
                    <td><Badge tipo={m.badge === "badge-gold" ? "gold" : "gray"}>{m.plano}</Badge></td>
                    <td className="text-muted">{m.desde}</td>
                    <td style={{ minWidth: 140 }}>
                      {m.uso}/{m.max ?? "∞"} visitas
                      <ProgressBar pct={pct} color={barColor} />
                    </td>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: scoreColor }}>{m.scoreLabel}</span></td>
                    <td><Badge tipo={m.status === "badge-green" ? "green" : "red"}>{m.statusLabel}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── PAGE: CRM ────────────────────────────────────────────────────────────────
function PageCRM() {
  const [selected, setSelected] = useState(clientes[0]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Clientes</div>
          <div className="page-sub">CRM e histórico de atendimento</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary">+ Novo cliente</button>
        </div>
      </div>

      <div className="content">
        <div className="crm-layout">
          {/* LISTA */}
          <div className="client-list-wrap">
            <div className="client-search-wrap">
              <input className="client-search" placeholder="Buscar cliente..." />
            </div>
            {clientes.map(c => (
              <div key={c.id} className={`client-row ${selected.id === c.id ? "active" : ""}`} onClick={() => setSelected(c)}>
                <div className={`avatar ${c.planoKey === "black" ? "avatar-gold" : "avatar-gray"}`}>{c.iniciais}</div>
                <div>
                  <div className="client-row-name">{c.nome}</div>
                  <div className="client-row-sub">{c.plano} · há {c.diasAtras} dias</div>
                </div>
              </div>
            ))}
          </div>

          {/* DETALHE */}
          <div className="crm-detail-wrap">
            <div className="crm-header-card">
              <div className={`avatar avatar-lg ${selected.planoKey === "black" ? "avatar-gold" : "avatar-gray"}`}>{selected.iniciais}</div>
              <div style={{ flex: 1 }}>
                <div className="crm-name">{selected.nome}</div>
                <div className="crm-contact">📱 {selected.telefone} · 📧 {selected.email} · 🎂 {selected.aniversario}</div>
                <div className="crm-tags">
                  <Badge tipo={selected.planoKey === "black" ? "gold" : "gray"}>{selected.plano}</Badge>
                  {selected.nps >= 9 && <Badge tipo="green">VIP</Badge>}
                  <Badge tipo="gray">Desde {selected.desde}</Badge>
                </div>
              </div>
              <button className="btn btn-outline">Editar</button>
            </div>

            <div className="stat-grid stat-grid-4">
              <StatCard label="Visitas total" value={selected.visitas} />
              <StatCard label="Ticket médio" value={`R$${selected.ticket}`} color="var(--gold)" />
              <StatCard label="Frequência" value={selected.frequencia} />
              <StatCard label="NPS" value={selected.nps} color="var(--green)" />
            </div>

            <div className="card">
              <div className="section-row">
                <div className="section-title">Preferências do cliente</div>
                <button className="btn btn-ghost" style={{ fontSize: 11 }}>Editar</button>
              </div>

              {[
                { label: "Corte preferido", items: selected.corte, destaque: 0 },
                { label: "Barba", items: selected.barba, destaque: 0 },
                { label: "Extras favoritos", items: selected.extras, destaque: selected.extras.length - 1 },
              ].map(s => s.items.length > 0 && (
                <div key={s.label} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", marginBottom: 7 }}>{s.label}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {s.items.map((tag, i) => (
                      <span key={tag} className={`pref-tag ${i === s.destaque ? "pref-tag-gold" : ""}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}

              {selected.obs && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--muted)", marginBottom: 7 }}>Observações</div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px", fontSize: 12, color: "var(--text)", lineHeight: 1.6 }}>
                    "{selected.obs}"
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-title mb-12">Histórico de visitas</div>
              {selected.historico.map((h, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${i > 0 ? "timeline-dot-gray" : ""}`} />
                  <div className="timeline-date">{h.data}</div>
                  <div>
                    <div className="timeline-desc">{h.svc}</div>
                    <div className="timeline-sub">
                      {h.barb} · R${h.valor}
                      {h.avaliacao && ` · ${"★".repeat(h.avaliacao)}`}
                      {h.indicou && ` · Indicou: ${h.indicou}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── PAGE: DASHBOARD ──────────────────────────────────────────────────────────
function PageDashboard() {
  const alertas = [
    { cor: "var(--gold)", text: "João Vieira — 6 visitas no mês. Indicado para upgrade Clube Black.", sub: "Oportunidade: +R$110/mês de receita" },
    { cor: "var(--red)", text: "Roberto Lima — sem visita há 28 dias. Risco de churn detectado.", sub: "Plano: Corte · Ação: WhatsApp" },
    { cor: "var(--gold)", text: "Carlos Ferreira faz aniversário em 15 dias. Enviar gift card?", sub: "Histórico: sempre aceita extras no aniversário" },
    { cor: "var(--green)", text: "Lucas P. abaixo da meta. Agenda tem 7 slots disponíveis hoje.", sub: "Sugestão: campanha de encaixe via WhatsApp" },
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Dashboard da equipe</div>
          <div className="page-sub">Performance em tempo real · Março 2026</div>
        </div>
        <div className="topbar-right">
          <Badge tipo="gold">Ao vivo</Badge>
          <button className="btn btn-outline">Exportar</button>
        </div>
      </div>

      <div className="content">
        <div className="stat-grid stat-grid-4 mb-16">
          <StatCard label="Faturamento do mês" value="R$41.280" trend="↑ +14% vs fev" />
          <StatCard label="Atendimentos" value="384" trend="↑ +28" />
          <StatCard label="Clube vendido" value="12" trend="↑ novos membros" />
          <StatCard label="Ocupação agenda" value="87%" trend="Meta: 90%" trendDir="neutral" color="var(--green)" />
        </div>

        {/* RANKING */}
        <div className="table-wrap mb-16">
          <div className="row-between" style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            <span className="section-title">Ranking de barbeiros — Março 2026</span>
            <Badge tipo="gold">Ao vivo</Badge>
          </div>
          {[...barbeiros].sort((a, b) => b.faturamento - a.faturamento).map((b, i) => {
            const pct = (b.faturamento / b.meta) * 100;
            const barColor = pct >= 90 ? "green" : pct >= 70 ? "gold" : "red";
            return (
              <div key={b.id} className="ranking-row">
                <div className={`rank-num ${i === 0 ? "gold" : ""}`}>{i + 1}</div>
                <div className="ranking-meta">
                  <div className="ranking-name">{b.nome}</div>
                  <div className="ranking-sub">{b.atendimentos} hoje · {b.clubes} clubes vendidos</div>
                  <div style={{ marginTop: 6, maxWidth: 300 }}>
                    <div className="row-between" style={{ fontSize: 10, color: "var(--muted)", marginBottom: 3 }}>
                      <span>Meta mensal</span>
                      <span>R${b.faturamento.toLocaleString("pt-BR")} / R${b.meta.toLocaleString("pt-BR")}</span>
                    </div>
                    <ProgressBar pct={pct} color={barColor} />
                  </div>
                </div>
                <div className="ranking-kpis">
                  <div className="kpi">
                    <div className="kpi-val">R${b.faturamento.toLocaleString("pt-BR")}</div>
                    <div className="kpi-label">Faturamento</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-val">R${b.ticket}</div>
                    <div className="kpi-label">Ticket médio</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-val" style={{ color: b.retencao >= 90 ? "var(--green)" : b.retencao >= 80 ? "var(--amber)" : "var(--red)" }}>
                      {b.retencao}%
                    </div>
                    <div className="kpi-label">Retenção</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="two-col">
          <div className="card">
            <div className="section-title mb-12">Alertas inteligentes</div>
            {alertas.map((a, i) => (
              <div key={i} className="alert-item">
                <div className="alert-dot" style={{ background: a.cor }} />
                <div>
                  <div className="alert-text">{a.text}</div>
                  <div className="alert-sub">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title mb-12">Meta geral do mês</div>
            {[
              { label: "Faturamento atual", val: "R$41.280", color: "" },
              { label: "Meta do mês", val: "R$50.000", color: "" },
              { label: "Faltam", val: "R$8.720", color: "var(--amber)" },
              { label: "Dias restantes", val: "0", color: "var(--muted)" },
            ].map(r => (
              <div key={r.label} className="row-between" style={{ padding: "7px 0", borderBottom: "1px solid var(--border)" }}>
                <span className="text-muted text-small">{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: r.color || "var(--text)" }}>{r.val}</span>
              </div>
            ))}
            <div style={{ marginTop: 14 }}>
              <div className="row-between" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                <span>Progresso do mês</span><span>82,6%</span>
              </div>
              <ProgressBar pct={82.6} color="gold" />
            </div>
            <div style={{ marginTop: 16 }}>
              <AIBox text="Faltam R$8.720 para a meta. Com 7 slots disponíveis hoje, uma campanha de encaixe pode gerar R$840 extras." />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const navItems = [
  { key: "agenda", label: "Agenda", icon: "📅", section: "Principal" },
  { key: "clube", label: "Clube", icon: "♛", section: null },
  { key: "crm", label: "Clientes", icon: "👤", badge: null, section: null },
  { key: "dashboard", label: "Dashboard", icon: "📊", section: null },
  { key: "financeiro", label: "Financeiro", icon: "💰", section: "Em breve", disabled: true },
  { key: "experiencia", label: "Experiência", icon: "⭐", section: null, disabled: true },
  { key: "config", label: "Configurações", icon: "⚙️", section: null, disabled: true },
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("agenda");

  const pages = {
    agenda: <PageAgenda />,
    clube: <PageClube />,
    crm: <PageCRM />,
    dashboard: <PageDashboard />,
  };

  let lastSection = null;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">G</div>
              <div className="logo-name">BarberFlow</div>
            </div>
            <div className="logo-tagline">Sistema de gestão</div>
          </div>

          <nav className="nav">
            {navItems.map(item => {
              const showSection = item.section && item.section !== lastSection;
              if (item.section) lastSection = item.section;
              return (
                <div key={item.key}>
                  {showSection && <div className="nav-section">{item.section}</div>}
                  <div
                    className={`nav-item ${page === item.key ? "active" : ""} ${item.disabled ? "disabled" : ""}`}
                    onClick={() => !item.disabled && setPage(item.key)}
                    style={item.disabled ? { opacity: 0.4, cursor: "default" } : {}}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                    {item.disabled && <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>EM BREVE</span>}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="sidebar-user">
            <div className="user-avatar">GC</div>
            <div>
              <div className="user-name">BarberFlow</div>
              <div className="user-role">Administrador</div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          {pages[page] || pages["agenda"]}
        </div>
      </div>
    </>
  );
}
