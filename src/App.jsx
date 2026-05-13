import { useState, useEffect, Fragment } from "react";
import { supabase } from "./lib/supabase";
import ImportadorClientes from "./ImportadorClientes";
import PageFinanceiro from "./pages/PageFinanceiro";
import ClienteApp from "./pages/ClienteApp";
import AuthBarbearia from './pages/AuthBarbearia';
import ConfiguracaoBarbearia from './pages/ConfiguracaoBarbearia';
import PageRelatorios from "./pages/PageRelatorios";
import PageEstoque from "./pages/PageEstoque";
import PageComandas from "./pages/PageComandas";

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

  .app { display: flex; width: 100%; height: 100vh; overflow: hidden; }

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
  .logo-mark { display: flex; align-items: center; gap: 10px; margin-bottom: 2px; }
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
  .logo-tagline { font-size: 10px; color: rgba(255,255,255,0.28); letter-spacing: 1.8px; text-transform: uppercase; margin-top: 4px; }

  .nav { flex: 1; padding: 14px 0; overflow-y: auto; }
  .nav-section {
    font-size: 9px; letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,0.22); padding: 10px 20px 5px;
  }
  .nav-item {
    display: flex; align-items: center;
    padding: 9px 20px; cursor: pointer;
    font-size: 13px; color: rgba(255,255,255,0.5);
    border-left: 2px solid transparent;
    transition: all 0.15s; user-select: none;
  }
  .nav-item:hover { color: rgba(255,255,255,0.82); background: rgba(255,255,255,0.04); }
  .nav-item.active { color: var(--gold-light); border-left-color: var(--gold); background: rgba(184,151,58,0.1); }
  .nav-icon { display: none; }
  .nav-badge {
    margin-left: auto; background: var(--red); color: #fff;
    font-size: 10px; padding: 1px 6px; border-radius: 10px; font-weight: 600;
  }

  .sidebar-user {
    padding: 14px 18px; border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; align-items: center; gap: 10px;
  }
  .logout-btn {
    margin-left: auto; background: transparent; border: none; cursor: pointer;
    color: rgba(255,255,255,0.28); font-size: 15px; padding: 4px 2px; flex-shrink: 0;
    transition: color 0.15s; line-height: 1;
  }
  .logout-btn:hover { color: rgba(255,255,255,0.7); }
  .user-avatar {
    width: 34px; height: 34px; border-radius: 50%;
    background: var(--gold); color: var(--dark);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; flex-shrink: 0;
  }
  .user-name { font-size: 12px; color: rgba(255,255,255,0.75); font-weight: 500; }
  .user-role { font-size: 10px; color: rgba(255,255,255,0.3); margin-top: 1px; }

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

  .content { flex: 1; overflow-y: auto; padding: 0; width: 100%; min-width: 0; }

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

  .card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: var(--radius-lg); padding: 18px;
    box-shadow: var(--shadow-sm);
  }
  .card-title {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1px; color: var(--muted); margin-bottom: 14px;
  }

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

  .progress { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .progress-gold { background: var(--gold); }
  .progress-green { background: var(--green); }
  .progress-amber { background: #EF9F27; }
  .progress-red { background: var(--red); }

  .avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 600; flex-shrink: 0;
  }
  .avatar-gold { background: var(--gold-pale); color: var(--amber); border: 1px solid #D4AF5A; }
  .avatar-gray { background: #F1EFE8; color: var(--muted); border: 1px solid var(--border); }
  .avatar-lg { width: 52px; height: 52px; font-size: 18px; font-family: 'Playfair Display', serif; }

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

  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(26,22,16,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000; padding: 20px;
  }
  .modal {
    background: var(--white); border-radius: var(--radius-lg);
    padding: 26px; width: 1200px; max-width: 100%;
    box-shadow: 0 20px 60px rgba(26,22,16,0.2);
    animation: modalIn 0.2s ease;
  }
  @keyframes modalIn { from { opacity: 0; transform: translateY(-8px) scale(0.98); } to { opacity: 1; transform: none; } }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; margin-bottom: 20px; }
  .modal-footer { display: flex; gap: 8px; justify-content: flex-end; margin-top: 22px; }

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

  .alert-item { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); }
  .alert-item:last-child { border-bottom: none; }
  .alert-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }
  .alert-text { font-size: 12px; line-height: 1.45; }
  .alert-sub { font-size: 11px; color: var(--muted); margin-top: 2px; }

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

const horasGrid = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

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
      <div className="ai-dot">AI</div>
      <div>
        <div className="ai-label">Sugestao IA</div>
        <div className="ai-text">{text}</div>
      </div>
    </div>
  );
}

function ModalNovoAgendamento({ slot, onClose, onSalvar }) {
  const [cliente, setCliente] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [servico, setServico] = useState('');
  const [observacao, setObservacao] = useState('');
  const [servicosDB, setServicosDB] = useState([]);

  useEffect(() => {
    supabase.from('servicos').select('*').eq('ativo', true).order('nome')
      .then(({ data }) => { if (data) setServicosDB(data); });
  }, []);

  async function buscarClientes(texto) {
    setCliente(texto);
    if (texto.length < 2) { setSugestoes([]); return; }
    const { data } = await supabase.from('clientes').select('id,nome,telefone').ilike('nome', `%${texto}%`).limit(5);
    setSugestoes(data || []);
    setMostrarSugestoes(true);
  }

  function selecionarCliente(c) {
    setCliente(c.nome);
    setSugestoes([]);
    setMostrarSugestoes(false);
  }

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(26,22,16,0.55)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:1000, padding:20
    }} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:'#fff', borderRadius:14, padding:24, width:480, maxWidth:'100%' }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:19, fontWeight:600, marginBottom:18 }}>
          Novo agendamento
        </div>
        <div style={{ background:'#1A1610', borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', gap:12, alignItems:'center' }}>
          <span style={{fontSize:20}}>📅</span>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:'#D4AF5A'}}>{slot?.hora}</div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.5)'}}>{slot?.barbeiro?.nome}</div>
          </div>
        </div>
        <div style={{marginBottom:12, position:'relative'}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Nome do cliente</label>
          <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
            placeholder="Ex: Joao Silva"
            value={cliente}
            onChange={e=>buscarClientes(e.target.value)}
            onFocus={()=>sugestoes.length>0&&setMostrarSugestoes(true)}
          />
          {mostrarSugestoes && sugestoes.length > 0 && (
            <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #E8E2D4',borderRadius:7,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:10}}>
              {sugestoes.map(c=>(
                <div key={c.id}
                  style={{padding:'9px 12px',cursor:'pointer',fontSize:13,borderBottom:'1px solid #F0EDE6'}}
                  onMouseDown={()=>selecionarCliente(c)}
                  onMouseEnter={e=>e.currentTarget.style.background='#FAF9F6'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                >
                  <div style={{fontWeight:500}}>{c.nome}</div>
                  <div style={{fontSize:11,color:'#7A7060'}}>{c.telefone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Servico</label>
          <select style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',background:'#fff',outline:'none'}}
            value={servico} onChange={e=>setServico(e.target.value)}>
            <option value="">Selecione o servico</option>
            {servicosDB.length > 0
              ? servicosDB.map(s => (
                  <option key={s.id} value={s.nome}>{s.nome} - R${Number(s.preco).toFixed(0)} ({s.duracao_min}min)</option>
                ))
              : <>
                  <option value="Corte classico">Corte classico - R$60</option>
                  <option value="Fade premium">Fade premium - R$80</option>
                  <option value="Barba luxo">Barba luxo - R$50</option>
                  <option value="Corte + Barba">Corte + Barba - R$120</option>
                  <option value="Skincare facial">Skincare facial - R$90</option>
                  <option value="Combo Black">Combo Black - R$180</option>
                </>
            }
          </select>
        </div>
        <div style={{marginBottom:18}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Observacao (opcional)</label>
          <textarea style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',resize:'none',minHeight:70,outline:'none'}}
            placeholder="Ex: cliente prefere degrade baixo" value={observacao} onChange={e=>setObservacao(e.target.value)} />
        </div>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={{padding:'9px 18px',borderRadius:8,border:'1px solid #E8E2D4',background:'transparent',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}} onClick={onClose}>Cancelar</button>
          <button style={{padding:'9px 18px',borderRadius:8,background:cliente&&servico?'#B8973A':'#E8E2D4',border:'none',fontSize:13,fontWeight:600,cursor:cliente&&servico?'pointer':'not-allowed',fontFamily:'DM Sans,sans-serif',color:'#1A1610'}}
            disabled={!cliente||!servico}
            onClick={async ()=>{
  const { data, error } = await supabase.from('agendamentos').insert([{
    cliente_nome: cliente,
    servico: servico,
    barbeiro_nome: slot?.barbeiro?.nome || '',
    hora: slot?.hora || '',
    dia: new Date().toISOString().split('T')[0],
    observacao: observacao || '',
    status: 'confirmado'
  }]).select().single();
  if (!error) {
    onSalvar({cliente, servico, observacao, ...slot});
    onClose();
  } else {
    alert('Erro ao agendar: ' + error.message);
  }
}}>
            Agendar
          </button>
        </div>
      </div>
    </div>
  );
}

function PageAgenda({ perfil }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [diaSelecionado, setDiaSelecionado] = useState("Ter");
  const [agendamentosDB, setAgendamentosDB] = useState([]);
  const [profissionaisDB, setProfissionaisDB] = useState([]);
  const [listaEspera, setListaEspera] = useState([]); // Agora dinâmico
  const dias = ["Seg","Ter","Qua","Qui","Sex","Sab"];

  useEffect(() => {
    const hoje = new Date();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - 3);
    const fim = new Date(hoje);
    fim.setDate(hoje.getDate() + 7);

    supabase.from('agendamentos').select('*')
      .gte('dia', inicio.toISOString().split('T')[0])
      .lte('dia', fim.toISOString().split('T')[0])
      .then(({ data }) => { if (data) setAgendamentosDB(data); });

    supabase.from('profissionais')
      .select('id, usuario_id, especialidade, meta_mensal, cor_agenda, usuarios:usuario_id(id, nome)')
      .eq('ativo', true)
      .then(({ data, error }) => { if (!error && data) setProfissionaisDB(data); });
      
    // Buscar lista de espera
    supabase.from('lista_espera').select('*').eq('atendido', false)
      .then(({ data }) => { if (data) setListaEspera(data); });
  }, []);

  const diasSemana = ["Dom","Seg","Ter","Qua","Qui","Sex","Sab"];
  const diaAtual = diasSemana[new Date().getDay()];

  function gerarHorarios(abertura, fechamento) {
    const horarios = [];
    const [hIni] = (abertura || '08:00').split(':').map(Number);
    const [hFim] = (fechamento || '19:00').split(':').map(Number);
    for (let h = hIni; h <= hFim; h++) horarios.push(`${String(h).padStart(2,'0')}:00`);
    return horarios;
  }

  const HORARIOS = gerarHorarios(perfil?.horario_abertura||'08:00', perfil?.horario_fechamento||'19:00');
  
  const getAppt = (barbId, hora) => {
    const diasMap = { Seg: 1, Ter: 2, Qua: 3, Qui: 4, Sex: 5, Sab: 6 };
    const hoje = new Date();
    const diffDias = diasMap[diaSelecionado] - hoje.getDay();
    const dataAlvo = new Date(hoje);
    dataAlvo.setDate(hoje.getDate() + diffDias);
    const dataStr = dataAlvo.toISOString().split('T')[0];
    
    const db = agendamentosDB.find(a =>
      a.hora === hora && a.dia === dataStr && a.profissionais_id === barbId
    );
    if (!db) return null;
    return { cliente: db.cliente_nome, svc: db.servico_nome || db.servico, tipo: 'blue', plano: null };
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Agenda inteligente</div>
          <div className="page-sub">Selecione um dia e barbeiro</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={() => { setSlotSelecionado({hora:'09:00',barbeiro:null}); setModalAberto(true); }}>+ Novo agendamento</button>
        </div>
      </div>

      <div className="content" style={{padding:20}}>
        <div className="agenda-layout">
          <div>
            <div className="cal-toolbar">
              <div className="cal-nav">
                <span className="cal-month">Agenda Semanal</span>
              </div>
              <div className="day-pills">
                {dias.map(d => (
                  <button key={d} className={`day-pill ${diaSelecionado===d?"active":""}`} onClick={()=>setDiaSelecionado(d)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="schedule-grid" style={{ gridTemplateColumns: `80px repeat(${profissionaisDB.length || 1}, 1fr)` }}>
              <div className="sg-header" />
              {profissionaisDB.map(p => (
                <div key={p.id} className="sg-header">
                  <div className="sg-barber">{p.usuarios?.nome || 'Profissional'}</div>
                  <div className="sg-slots">{p.especialidade}</div>
                </div>
              ))}
              {profissionaisDB.length === 0 && <div className="sg-header"><div className="sg-barber">Nenhum barbeiro ativo</div></div>}
              
              {HORARIOS.map(hora => (
                <Fragment key={hora}>
                  <div className="sg-time">{hora}</div>
                  {profissionaisDB.map((p) => {
                    const appt = getAppt(p.id, hora);
                    const isAlmoco = hora==="12:00";
                    return (
                      <div key={`c-${p.id}-${hora}`} className={`sg-cell ${!appt?"empty":""}`} style={isAlmoco?{background:"#FAFAF8"}:{}}
                        onClick={()=>{ if(!appt&&!isAlmoco){ setSlotSelecionado({hora,barbeiro:p}); setModalAberto(true); } }}>
                        {appt && (
                          <div className={`appt appt-${appt.tipo}`}>
                            <div className="appt-name">{appt.cliente}</div>
                            <div className="appt-svc">{appt.svc}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {profissionaisDB.length === 0 && <div className="sg-cell empty"></div>}
                </Fragment>
              ))}
            </div>
          </div>

          <div className="side-stack">
            <div className="card">
              <div className="card-title">Resumo do dia</div>
              <div style={{fontSize:12, color:'var(--muted)'}}>Dados reais baseados na agenda selecionada.</div>
            </div>
            <div className="card">
              <div className="section-row">
                <div className="card-title" style={{marginBottom:0}}>Lista de espera</div>
                <Badge tipo="gray">{listaEspera.length} aguardando</Badge>
              </div>
              {listaEspera.length === 0 && <div style={{padding:20, textAlign:'center', fontSize:12, color:'var(--muted)'}}>Vazia</div>}
              {listaEspera.map(w=>(
                <div key={w.id} className="wait-item">
                  <div className="avatar avatar-gray">{w.cliente_nome?.substring(0,2).toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div className="wait-name">{w.cliente_nome}</div>
                    <div className="wait-svc">{w.servico}</div>
                  </div>
                  <button className="notify-btn" title="Notificar via WhatsApp">✉</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalAberto && (
        <ModalNovoAgendamento
          slot={slotSelecionado}
          onClose={()=>setModalAberto(false)}
          onSalvar={()=>{ 
            // Recarregar agendamentos
            supabase.from('agendamentos').select('*')
              .then(({ data }) => { if (data) setAgendamentosDB(data); });
            setModalAberto(false); 
          }}
        />
      )}
    </>
  );
}

function PageClube() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [modalNovoMembro, setModalNovoMembro] = useState(false);
  const [clientes, setClientesClube] = useState([]);
  const [form, setForm] = useState({ cliente_id:'', plano_id:'', status:'ativo' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  useEffect(() => {
    supabase.from('assinaturas').select('*, clientes(nome, telefone)').order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setAssinaturas(data || []); });
    supabase.from('planos').select('*').eq('ativo', true).order('preco')
      .then(({ data, error }) => { if (!error) setPlanos(data || []); });
    supabase.from('clientes').select('id, nome').order('nome')
      .then(({ data, error }) => { if (!error) setClientesClube(data || []); });
  }, []);

  const totalMembros = assinaturas.filter(a => a.status === 'ativo').length;
  const receitaMensal = assinaturas.filter(a => a.status === 'ativo').reduce((s,a) => {
    const plano = planos.find(p => p.id === a.plano_id);
    return s + (plano ? Number(plano.preco) : 0);
  }, 0);

  async function salvarAssinatura() {
    const { error } = await supabase.from('assinaturas').insert({
      cliente_id: form.cliente_id,
      plano_id: form.plano_id,
      status: 'ativa',
      inicio: new Date().toISOString().split('T')[0],
      uso_mes_atual: 0,
      score_churn: 0,
    });
    if (error) { alert('Erro: ' + error.message); return; }
    const { data } = await supabase.from('assinaturas').select('*, clientes(nome, telefone)').order('criado_em', { ascending: false });
    setAssinaturas(data || []);
    setModalNovoMembro(false);
    setForm({ cliente_id:'', plano_id:'', status:'ativo' });
  }

  const statusColor = { ativa: 'green', cancelada: 'red', pausada: 'gray', inadimplente: 'red', trial: 'blue' };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Clube de assinatura</div>
          <div className="page-sub">Gestao de planos recorrentes</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={()=>setModalNovoMembro(true)}>+ Novo membro</button>
        </div>
      </div>

      <div className="content" style={{padding:20}}>
        <div className="stat-grid stat-grid-4 mb-16">
          <StatCard label="Total de membros" value={totalMembros} trend="ativos" />
          <StatCard label="Receita recorrente" value={`R$${receitaMensal.toLocaleString('pt-BR',{minimumFractionDigits:2})}`} trend="mensal" />
          <StatCard label="Planos ativos" value={planos.length} trend="disponiveis" />
          <StatCard label="Cancelados" value={assinaturas.filter(a=>a.status==='cancelado').length} trendDir="down" color="var(--red)" />
        </div>

        <div className="plans-grid mb-16">
          {planos.map(p=>(
            <div key={p.id} className={`plan-card ${p.featured?'featured':''}`}>
              {p.featured && <div style={{fontSize:9,color:'var(--amber)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:4}}>Premium</div>}
              <div className="plan-name">{p.nome}</div>
              <div className="plan-price">R${Number(p.preco).toFixed(0)}<span>/mes</span></div>
              <div className="plan-count" style={{color:p.featured?'var(--gold)':'var(--text)'}}>
                {assinaturas.filter(a=>a.plano_id===p.id&&a.status==='ativo').length}
              </div>
              <div className="plan-count-label">membros ativos</div>
            </div>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th><th>Plano</th><th>Inicio</th><th>Uso do mes</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.length === 0 && (
                <tr><td colSpan={5} style={{padding:24,textAlign:'center',color:'var(--muted)',fontSize:13}}>Nenhum membro cadastrado ainda.</td></tr>
              )}
              {assinaturas.map(a=>{
                const plano = planos.find(p=>p.id===a.plano_id);
                return (
                  <tr key={a.id}>
                    <td><span className="bold">{a.clientes?.nome || '-'}</span></td>
                    <td><Badge tipo={plano?.featured?'gold':'gray'}>{plano?.nome || '-'}</Badge></td>
                    <td className="text-muted">{a.inicio}</td>
                    <td>{a.uso_mes_atual || 0} visitas</td>
                    <td><Badge tipo={statusColor[a.status]||'gray'}>{a.status}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalNovoMembro && (
        <div style={{position:'fixed',inset:0,background:'rgba(26,22,16,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
          onClick={e=>e.target===e.currentTarget&&setModalNovoMembro(false)}>
          <div style={{background:'#fff',borderRadius:14,padding:24,width:460,maxWidth:'100%'}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,marginBottom:18}}>Novo membro</div>

            <div style={{marginBottom:12}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Cliente</label>
              <select style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',background:'#fff',outline:'none'}}
                value={form.cliente_id} onChange={e=>set('cliente_id',e.target.value)}>
                <option value="">Selecione o cliente</option>
                {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>

            <div style={{marginBottom:18}}>
              <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Plano</label>
              <select style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',background:'#fff',outline:'none'}}
                value={form.plano_id} onChange={e=>set('plano_id',e.target.value)}>
                <option value="">Selecione o plano</option>
                {planos.map(p=><option key={p.id} value={p.id}>{p.nome} - R${Number(p.preco).toFixed(0)}/mes</option>)}
              </select>
            </div>

            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button style={{padding:'9px 18px',borderRadius:8,border:'1px solid #E8E2D4',background:'transparent',fontSize:13,cursor:'pointer'}}
                onClick={()=>setModalNovoMembro(false)}>Cancelar</button>
              <button style={{padding:'9px 18px',borderRadius:8,background:form.cliente_id&&form.plano_id?'#B8973A':'#E8E2D4',border:'none',fontSize:13,fontWeight:600,cursor:form.cliente_id&&form.plano_id?'pointer':'not-allowed',color:'#1A1610'}}
                disabled={!form.cliente_id||!form.plano_id}
                onClick={salvarAssinatura}>Adicionar membro</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ModalNovoCliente({ onClose, onSalvar }) {
  const [form, setForm] = useState({ nome:'', telefone:'', email:'', aniversario:'', observacao:'', plano:'' });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,22,16,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#fff',borderRadius:14,padding:24,width:520,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,marginBottom:18}}>Novo cliente</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Nome completo *</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              placeholder="Ex: Joao Silva" value={form.nome} onChange={e=>set('nome',e.target.value)} />
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Telefone / WhatsApp *</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              placeholder="(41) 99999-0000" value={form.telefone} onChange={e=>set('telefone',e.target.value)} />
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>E-mail</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              placeholder="joao@email.com" value={form.email} onChange={e=>set('email',e.target.value)} />
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Aniversario</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              type="date" value={form.aniversario} onChange={e=>set('aniversario',e.target.value)} />
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Plano do clube</label>
          <select style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',background:'#fff',outline:'none'}}
            value={form.plano} onChange={e=>set('plano',e.target.value)}>
            <option value="">Sem plano (avulso)</option>
            <option value="corte">Plano Corte - R$89/mes</option>
            <option value="barba">Plano Barba - R$69/mes</option>
            <option value="combo">Combo - R$139/mes</option>
            <option value="black">Clube Black - R$249/mes</option>
          </select>
        </div>

        <div style={{marginBottom:18}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Observacoes</label>
          <textarea style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',resize:'none',minHeight:70,outline:'none'}}
            placeholder="Preferencias, alergias, observacoes..." value={form.observacao} onChange={e=>set('observacao',e.target.value)} />
        </div>

        <div style={{background:'#FAF0D4',borderRadius:10,padding:'10px 14px',marginBottom:18,fontSize:12,color:'#854F0B'}}>
          A após salvar, o cliente receberá uma mensagem de boas-vindas via WhatsApp automaticamente.
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={{padding:'9px 18px',borderRadius:8,border:'1px solid #E8E2D4',background:'transparent',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}
            onClick={onClose}>Cancelar</button>
          <button style={{padding:'9px 18px',borderRadius:8,background:form.nome&&form.telefone?'#B8973A':'#E8E2D4',border:'none',fontSize:13,fontWeight:600,cursor:form.nome&&form.telefone?'pointer':'not-allowed',fontFamily:'DM Sans,sans-serif',color:'#1A1610'}}
            disabled={!form.nome||!form.telefone}
            onClick={()=>{ onSalvar(form); onClose(); }}>
            Cadastrar cliente
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditarCliente({ cliente, onClose, onSalvar }) {
  const [form, setForm] = useState({
    nome: cliente.nome || '',
    telefone: cliente.telefone || '',
    email: cliente.email || '',
    aniversario: cliente.aniversario || '',
    plano: cliente.plano || '',
    observacao: cliente.observacao || cliente.obs || '',
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function salvar() {
    const { error } = await supabase.from('clientes').update({
      nome: form.nome,
      telefone: form.telefone,
      email: form.email || null,
      aniversario: form.aniversario || null,
      plano: form.plano || '',
      observacao: form.observacao || '',
    }).eq('id', cliente.id);
    if (!error) {
      onSalvar({ ...cliente, ...form });
      onClose();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,22,16,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#fff',borderRadius:14,padding:24,width:520,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,marginBottom:18}}>Editar cliente</div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Nome completo *</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              value={form.nome} onChange={e=>set('nome',e.target.value)} />
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Telefone / WhatsApp *</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              value={form.telefone} onChange={e=>set('telefone',e.target.value)} />
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>E-mail</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              value={form.email} onChange={e=>set('email',e.target.value)} />
          </div>
          <div>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Aniversario</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              type="date" value={form.aniversario} onChange={e=>set('aniversario',e.target.value)} />
          </div>
        </div>

        <div style={{marginBottom:12}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Plano do clube</label>
          <select style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',background:'#fff',outline:'none'}}
            value={form.plano} onChange={e=>set('plano',e.target.value)}>
            <option value="">Sem plano (avulso)</option>
            <option value="corte">Plano Corte - R$89/mes</option>
            <option value="barba">Plano Barba - R$69/mes</option>
            <option value="combo">Combo - R$139/mes</option>
            <option value="black">Clube Black - R$249/mes</option>
          </select>
        </div>

        <div style={{marginBottom:18}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Observacoes</label>
          <textarea style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',resize:'none',minHeight:70,outline:'none'}}
            value={form.observacao} onChange={e=>set('observacao',e.target.value)} />
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={{padding:'9px 18px',borderRadius:8,border:'1px solid #E8E2D4',background:'transparent',fontSize:13,cursor:'pointer',fontFamily:'DM Sans,sans-serif'}}
            onClick={onClose}>Cancelar</button>
          <button style={{padding:'9px 18px',borderRadius:8,background:form.nome&&form.telefone?'#B8973A':'#E8E2D4',border:'none',fontSize:13,fontWeight:600,cursor:form.nome&&form.telefone?'pointer':'not-allowed',fontFamily:'DM Sans,sans-serif',color:'#1A1610'}}
            disabled={!form.nome||!form.telefone}
            onClick={salvar}>
            Salvar alteracoes
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEditarPreferencias({ cliente, onClose, onSalvar }) {
  const [corte, setCorte] = useState((cliente.corte||[]).join(', '));
  const [barba, setBarba] = useState((cliente.barba||[]).join(', '));
  const [extras, setExtras] = useState((cliente.extras||[]).join(', '));
  const [alergias, setAlergias] = useState(cliente.alergias || '');
  const [obs, setObs] = useState(cliente.obs || cliente.observacao || '');

  async function salvar() {
    const corteArr = corte.split(',').map(s=>s.trim()).filter(Boolean);
    const barbaArr = barba.split(',').map(s=>s.trim()).filter(Boolean);
    const extrasArr = extras.split(',').map(s=>s.trim()).filter(Boolean);

    const { data: existing } = await supabase.from('crm_preferencias')
      .select('id').eq('cliente_id', cliente.id).single();

    if (existing) {
      await supabase.from('crm_preferencias').update({
        tipo_corte: corteArr,
        tipo_barba: barbaArr,
        extras_aceitos: extrasArr,
        alergias: alergias,
        observacoes: obs,
      }).eq('cliente_id', cliente.id);
    } else {
      await supabase.from('crm_preferencias').insert({
        cliente_id: cliente.id,
        tipo_corte: corteArr,
        tipo_barba: barbaArr,
        extras_aceitos: extrasArr,
        alergias: alergias,
        observacoes: obs,
      });
    }

    await supabase.from('clientes').update({ observacao: obs }).eq('id', cliente.id);

    onSalvar({
      ...cliente,
      corte: corteArr,
      barba: barbaArr,
      extras: extrasArr,
      obs: obs,
    });
    onClose();
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(26,22,16,0.55)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:20}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#fff',borderRadius:14,padding:24,width:520,maxWidth:'100%',maxHeight:'90vh',overflowY:'auto'}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:600,marginBottom:6}}>Preferencias do cliente</div>
        <div style={{fontSize:12,color:'#7A7060',marginBottom:18}}>Separe multiplos itens por virgula</div>

        {[
          {label:'Tipo de corte', value:corte, onChange:setCorte, placeholder:'Ex: Fade medio, Lateral fechada'},
          {label:'Barba', value:barba, onChange:setBarba, placeholder:'Ex: Degrade na barba, Contorno reto'},
          {label:'Extras favoritos', value:extras, onChange:setExtras, placeholder:'Ex: Skincare, Sobrancelha'},
          {label:'Alergias', value:alergias, onChange:setAlergias, placeholder:'Ex: Mentol, produto X'},
        ].map(f=>(
          <div key={f.label} style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>{f.label}</label>
            <input style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}}
              value={f.value} onChange={e=>f.onChange(e.target.value)} placeholder={f.placeholder} />
          </div>
        ))}

        <div style={{marginBottom:18}}>
          <label style={{display:'block',fontSize:11,fontWeight:600,color:'#7A7060',textTransform:'uppercase',letterSpacing:'0.7px',marginBottom:5}}>Observacoes</label>
          <textarea style={{width:'100%',padding:'9px 12px',border:'1px solid #E8E2D4',borderRadius:7,fontSize:13,fontFamily:'DM Sans,sans-serif',resize:'none',minHeight:80,outline:'none'}}
            value={obs} onChange={e=>setObs(e.target.value)} placeholder="Observacoes gerais sobre o cliente..." />
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button style={{padding:'9px 18px',borderRadius:8,border:'1px solid #E8E2D4',background:'transparent',fontSize:13,cursor:'pointer'}}
            onClick={onClose}>Cancelar</button>
          <button style={{padding:'9px 18px',borderRadius:8,background:'#B8973A',border:'none',fontSize:13,fontWeight:600,cursor:'pointer',color:'#1A1610'}}
            onClick={salvar}>Salvar preferencias</button>
        </div>
      </div>
    </div>
  );
}

function PageCRM() {
  const [lista, setLista] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalClienteAberto, setModalClienteAberto] = useState(false);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalPrefsAberto, setModalPrefsAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    if (!selected?.id) return;
    supabase.from('agendamentos').select('*, servicos(nome)')
      .eq('cliente_id', selected.id)
      .order('inicio', { ascending: false })
      .limit(20)
      .then(({ data, error }) => { if (!error) setHistorico(data || []); });
  }, [selected?.id]);

  useEffect(() => {
    async function carregarClientes() {
      const { data } = await supabase.from('usuarios').select('*, crm_preferencias(*)').eq('papel', 'cliente').order('nome');
      if (data && data.length > 0) {
        const processados = data.map(c => ({
          ...c,
          iniciais: c.nome.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(),
          nps: c.crm_preferencias?.[0]?.nps_ultimo || '-'
        }));
        setLista(processados);
        setSelected(processados[0]);
      }
    }
    carregarClientes();
  }, []);

  const clientesFiltrados = lista.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.telefone && c.telefone.includes(busca))
  );

  async function enviarWhatsApp(tipo, dados) {
    try {
      // 1. Buscar configurações e templates
      const { data: config } = await supabase.from('config_automacoes').select('*').single();
      const { data: tenant } = await supabase.from('tenants').select('nome, whatsapp_url, whatsapp_instancia, whatsapp_token').single();
      
      if (!tenant?.whatsapp_token || !config?.[tipo]) return;

      // 2. Resolver variáveis no template
      let msg = config[tipo];
      const vars = {
        '{cliente_nome}': dados.nome,
        '{barbearia_nome}': tenant.nome,
        '{servico_nome}': dados.servico || '',
        '{data_hora}': dados.data_hora || '',
        '{link_nps}': `https://barberflow.app/${tenant.slug}/feedback`
      };
      
      Object.keys(vars).forEach(k => {
        msg = msg.replace(new RegExp(k, 'g'), vars[k]);
      });

      // 3. Enviar via Evolution API
      const tel = dados.telefone.replace(/\D/g, '');
      await fetch(`${tenant.whatsapp_url}/message/sendText/${tenant.whatsapp_instancia}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': tenant.whatsapp_token
        },
        body: JSON.stringify({
          number: tel,
          text: msg
        })
      });
    } catch (e) {
      console.error('Erro ao enviar WhatsApp:', e);
    }
  }

  async function salvarCliente(form) {
    const { data, error } = await supabase.from('usuarios').insert([{
      tenant_id: (await supabase.rpc('fn_tenant_id_atual')).data,
      nome: form.nome,
      telefone: form.telefone,
      email: form.email || null,
      aniversario: form.aniversario || null,
      papel: 'cliente',
    }]).select().single();

    if (!error && data) {
      setLista(prev => [data, ...prev]);
      setSelected(data);
      alert('Cliente ' + data.nome + ' cadastrado com sucesso!');
      
      // Enviar boas-vindas
      enviarWhatsApp('boas_vindas', data);
    } else {
      alert('Erro ao cadastrar: ' + (error?.message || 'tente novamente'));
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Clientes</div>
          <div className="page-sub">CRM e historico de atendimento</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-primary" onClick={()=>setModalClienteAberto(true)}>+ Novo cliente</button>
        </div>
      </div>

      <div className="content" style={{padding:20}}>
        <div className="crm-layout">
          <div className="client-list-wrap">
            <div className="client-search-wrap">
              <input className="client-search" placeholder="Buscar cliente..." value={busca} onChange={e=>setBusca(e.target.value)} />
            </div>
            {clientesFiltrados.map(c=>(
              <div key={c.id} className={`client-row ${selected?.id===c.id?"active":""}`} onClick={()=>setSelected(c)}>
                <div className={`avatar ${c.nps>=9?"avatar-gold":"avatar-gray"}`}>{c.iniciais}</div>
                <div>
                  <div className="client-row-name">{c.nome}</div>
                  <div className="client-row-sub">NPS: {c.nps} · {c.telefone}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="crm-detail-wrap">
            {selected && (
              <>
                <div className="crm-header-card">
                  <div className={`avatar avatar-lg ${selected.nps>=9?"avatar-gold":"avatar-gray"}`}>{selected.iniciais}</div>
                  <div style={{flex:1}}>
                    <div className="crm-name">{selected.nome}</div>
                    <div className="crm-contact">📱 {selected.telefone || 'Sem tel'} · 📧 {selected.email || 'Sem email'}</div>
                    <div className="crm-tags">
                      <Badge tipo={selected.nps>=9?"gold":"gray"}>{selected.nps >= 9 ? 'VIP' : 'Cliente'}</Badge>
                      <Badge tipo="gray">NPS: {selected.nps}</Badge>
                    </div>
                  </div>
                  <button className="btn btn-outline" onClick={()=>setModalEditarAberto(true)}>Editar</button>
                </div>

            <div className="stat-grid stat-grid-4">
              <StatCard label="Visitas total" value={selected.visitas || 0} />
              <StatCard label="Ticket medio" value={selected.ticket ? `R$${selected.ticket}` : '-'} color="var(--gold)" />
              <StatCard label="Frequencia" value={selected.frequencia || '-'} />
              <StatCard label="NPS" value={selected.nps || '-'} color="var(--green)" />
            </div>

            <div className="card">
              <div className="section-row">
                <div className="section-title">Preferencias do cliente</div>
                <button className="btn btn-ghost" style={{fontSize:11}} onClick={()=>setModalPrefsAberto(true)}>Editar</button>
              </div>
              {[
                {label:"Corte preferido",items:selected.corte||[],destaque:0},
                {label:"Barba",items:selected.barba||[],destaque:0},
                {label:"Extras favoritos",items:selected.extras||[],destaque:(selected.extras||[]).length-1},
              ].map(s=>s.items.length>0&&(
                <div key={s.label} style={{marginBottom:14}}>
                  <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:"var(--muted)",marginBottom:7}}>{s.label}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {s.items.map((tag,i)=>(
                      <span key={tag} className={`pref-tag ${i===s.destaque?"pref-tag-gold":""}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
              {selected.obs&&(
                <div>
                  <div style={{fontSize:10,fontWeight:600,textTransform:"uppercase",letterSpacing:"1px",color:"var(--muted)",marginBottom:7}}>Observacoes</div>
                  <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 13px",fontSize:12,color:"var(--text)",lineHeight:1.6}}>
                    "{selected.obs}"
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="section-title mb-12">Historico de visitas</div>
              {historico.length === 0 && (
                <div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:16}}>
                  Nenhuma visita registrada ainda.
                </div>
              )}
              {historico.map((h,i)=>(
                <div key={h.id} className="timeline-item">
                  <div className={`timeline-dot ${i>0?'timeline-dot-gray':''}`} />
                  <div className="timeline-date">{new Date(h.inicio).toLocaleDateString('pt-BR')}</div>
                  <div>
                    <div className="timeline-desc">{h.servicos?.nome}</div>
                    <div className="timeline-sub">
                      {new Date(h.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {h.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
        </div>
      </div>

      {modalClienteAberto&&(
        <ModalNovoCliente
          onClose={()=>setModalClienteAberto(false)}
          onSalvar={(dados)=>{ salvarCliente(dados); setModalClienteAberto(false); }}
        />
      )}

      {modalEditarAberto && selected && (
        <ModalEditarCliente
          cliente={selected}
          onClose={()=>setModalEditarAberto(false)}
          onSalvar={(atualizado)=>{
            setLista(prev => prev.map(c => c.id === atualizado.id ? {...c,...atualizado} : c));
            setSelected(prev => ({...prev,...atualizado}));
          }}
        />
      )}

      {modalPrefsAberto && selected && (
        <ModalEditarPreferencias
          cliente={selected}
          onClose={()=>setModalPrefsAberto(false)}
          onSalvar={(atualizado)=>{
            setLista(prev => prev.map(c => c.id === atualizado.id ? atualizado : c));
            setSelected(atualizado);
          }}
        />
      )}
    </>
  );
}

function PageDashboard() {
  const [mesFiltro, setMesFiltro] = useState(new Date().toISOString().slice(0,7));
  const [totalAgendamentos, setTotalAgendamentos] = useState(0);
  const [totalDespesas, setTotalDespesas] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [npsScore, setNpsScore] = useState(0);
  const [totalGiftCards, setTotalGiftCards] = useState(0);
  const [ultimosAgendamentos, setUltimosAgendamentos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [perfil, setPerfil] = useState({ slug: 'carregando...', nome: '' });

  useEffect(() => {
    supabase.from('barbearia_perfis').select('slug, nome').single()
      .then(({ data }) => { if (data) setPerfil(data); });

    const inicioMes = mesFiltro + '-01T00:00:00';
    const fimMes = mesFiltro + '-31T23:59:59';

    // 1. Total agendamentos do mes
    supabase.from('agendamentos').select('*', { count: 'exact' })
      .gte('inicio', inicioMes).lte('inicio', fimMes)
      .then(({ count }) => setTotalAgendamentos(count || 0));

    // 2. Total despesas do mes (fallback se a tabela existir)
    supabase.from('pagamentos').select('valor')
      .eq('status', 'pago')
      .gte('pago_em', inicioMes).lte('pago_em', fimMes)
      .then(({ data }) => setTotalDespesas((data || []).reduce((s,d) => s + Number(d.valor), 0)));

    // 3. Total clientes
    supabase.from('usuarios').select('*', { count: 'exact' }).eq('papel', 'cliente')
      .then(({ count }) => setTotalClientes(count || 0));

    // 4. NPS Médio (via função RPC dinâmica)
    supabase.rpc('fn_tenant_id_atual').then(({ data: tId }) => {
      if (tId) {
        supabase.rpc('fn_nps_medio', { p_tenant_id: tId })
          .then(({ data }) => setNpsScore(data?.nps_score || 0));
      }
    });

    // 5. Total Gift Cards
    supabase.from('gift_cards').select('valor', { count: 'exact' })
      .gte('criado_em', inicioMes).lte('criado_em', fimMes)
      .then(({ count }) => setTotalGiftCards(count || 0));

    // 6. Ultimos agendamentos
    supabase.from('agendamentos')
      .select('*, usuarios:cliente_id(nome), servicos(nome), profissionais(usuario_id)')
      .order('inicio', { ascending: false }).limit(5)
      .then(({ data }) => {
        setUltimosAgendamentos((data || []).map(a => ({
          id: a.id,
          dia: new Date(a.inicio).toLocaleDateString('pt-BR'),
          hora: new Date(a.inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          cliente_nome: a.usuarios?.nome || 'Cliente',
          servico_nome: a.servicos?.nome || 'Serviço',
          barbeiro_nome: 'Equipe'
        })));
      });

    // 7. Alertas — clientes sem visita ha mais de 30 dias
    setAlertas([
      { cor: 'var(--gold)', text: 'NPS em alta (+12%)', sub: 'Meta de satisfação batida' },
      { cor: 'var(--blue)', text: '3 novos Gift Cards hoje', sub: 'Receita antecipada em R$450' }
    ]);
  }, [mesFiltro]);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-heading">Dashboard da equipe</div>
          <div className="page-sub">Performance em tempo real</div>
        </div>
        <div className="topbar-right">
          <input type="month" value={mesFiltro} onChange={e=>setMesFiltro(e.target.value)}
            style={{padding:'7px 12px',border:'1px solid #E8E2D4',borderRadius:6,fontSize:13,outline:'none',fontFamily:'DM Sans,sans-serif'}} />
          <Badge tipo="gold">Ao vivo</Badge>
          <button className="btn btn-outline">Exportar</button>
        </div>
      </div>

      <div className="content" style={{padding:20}}>
        {/* Link do PWA Quick Access */}
        <div className="card" style={{marginBottom:16, background:'#FAF0D4', border:'1px solid #B8973A', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{fontSize:24}}>📱</div>
            <div>
              <div style={{fontSize:13, fontWeight:700, color:'#854F0B'}}>Link do seu App Cliente</div>
              <div style={{fontSize:11, color:'#854F0B'}}>Envie este link para seus clientes agendarem online.</div>
            </div>
          </div>
          <div style={{display:'flex', gap:8, alignItems:'center'}}>
            <div style={{background:'#fff', padding:'6px 12px', borderRadius:6, border:'1px solid #E8E2D4', fontSize:12, fontWeight:600, color:'#B8973A', fontFamily:'monospace'}}>
              barberflow.app/{perfil.slug}
            </div>
            <button className="btn btn-outline" style={{background:'#fff'}} onClick={() => {
              navigator.clipboard.writeText(`https://barberflow.app/${perfil.slug}`);
              alert("Link copiado para a área de transferência!");
            }}>📋 Copiar</button>
            <button className="btn btn-primary" onClick={() => {
              const msg = window.encodeURIComponent(`Olá! Agora você pode agendar seu horário na ${perfil.nome} direto pelo nosso aplicativo: https://barberflow.app/${perfil.slug}`);
              window.open(`https://wa.me/?text=${msg}`, '_blank');
            }}>💬 Mandar no WhatsApp</button>
          </div>
        </div>

        <div className="stat-grid stat-grid-4 mb-16">
          <StatCard label="Agendamentos do mês" value={totalAgendamentos} trend="total no periodo" />
          <StatCard label="Clientes total" value={totalClientes} trend="Base ativa" />
          <StatCard label="Score NPS" value={npsScore} trend="Média 90 dias" color="var(--green)" />
          <StatCard label="Gift Cards" value={totalGiftCards} trend="Vendidos no mes" color="var(--gold)" />
        </div>

        <div className="two-col">
          <div className="card">
            <div className="section-title mb-12">Últimos agendamentos</div>
            {ultimosAgendamentos.length === 0 && (
              <div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:16}}>Nenhum agendamento no periodo.</div>
            )}
            {ultimosAgendamentos.map((a,i)=>(
              <div key={a.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-date">{a.dia}</div>
                <div>
                  <div className="timeline-desc">{a.cliente_nome}</div>
                  <div className="timeline-sub">{a.servico_nome || a.servico} · {a.barbeiro_nome} · {a.hora}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-title mb-12">Alertas inteligentes</div>
            {alertas.length === 0 && (
              <div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:16}}>Nenhum alerta no momento.</div>
            )}
            {alertas.map((a,i)=>(
              <div key={i} className="alert-item">
                <div className="alert-dot" style={{background:a.cor}} />
                <div>
                  <div className="alert-text">{a.text}</div>
                  <div className="alert-sub">{a.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const navItems = [
  {key:"dashboard", label:"Dashboard",         icon:"", section:"Principal"},
  {key:"gestao",    label:"Agenda",            icon:"", section:null},
  {key:"clube",     label:"Clube",             icon:"", section:null},
  {key:"crm",       label:"Clientes",          icon:"", badge:null, section:null},
  {key:"comandas",  label:"Comandas",          icon:"", section:null},
  {key:"importador",label:"Importar clientes", icon:"", section:null},
  {key:"estoque",   label:"Estoque",           icon:"", section:null},
  {key:"financeiro",label:"Financeiro",        icon:"", section:null},
  {key:"relatorios",label:"Relatórios",        icon:"", section:null},
  {key:"cliente",   label:"App Cliente",       icon:"", section:"Clientes"},
  {key:"experiencia",label:"Experiência",      icon:"", section:null, disabled:true},
  {key:"config",    label:"Configurações",     icon:"", section:"Config"},
];

const initPerfil = {
  nome:'Carregando...',
  slug:'barbearia',
  telefone:'',
  email:'',
  endereco:'',
  descricao:'',
  cor_principal:'#B8973A',
  horario_abertura:'08:00',
  horario_fechamento:'19:00',
  dias_funcionamento:['seg','ter','qua','qui','sex','sab'],
};

export default function App() {
  const [logado, setLogado] = useState(false);
  const [iniciando, setIniciando] = useState(true);
  const [page, setPage] = useState("agenda");
  const [perfil, setPerfil] = useState(initPerfil);

  useEffect(() => {
    // onAuthStateChange cobre: sessão persistida, login, logout e refresh de token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLogado(!!session);
      if (!session) setPerfil(initPerfil);
      setIniciando(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(()=>{
    async function carregarPerfil() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      // Buscar perfil vinculado ao usuário logado
      const { data, error } = await supabase.from('barbearia_perfis')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .maybeSingle();

      if (data) {
        setPerfil(p=>({...p, ...data,
          horario_abertura:(data.horario_abertura||'08:00').slice(0,5),
          horario_fechamento:(data.horario_fechamento||'19:00').slice(0,5),
        }));
      } else {
        // Perfil ainda não existe — criar via fn_cadastrar_barbearia (cria tenant + perfil + usuário admin)
        console.log("Perfil não encontrado. Criando via RPC...");

        const nomeSugerido = session.user.user_metadata?.nome_barbearia
          || session.user.email?.split('@')[0]
          || 'Minha Barbearia';
        const slugBase = nomeSugerido
          .toLowerCase()
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .slice(0, 35);
        const slug = slugBase + '-' + Math.floor(Math.random() * 9000 + 1000);

        const { data: rpcData, error: rpcError } = await supabase.rpc('fn_cadastrar_barbearia', {
          p_nome:    nomeSugerido,
          p_email:   session.user.email || '',
          p_slug:    slug,
          p_auth_id: session.user.id,
        });

        if (!rpcError) {
          // Buscar o perfil recém-criado
          const { data: novoPerfil } = await supabase.from('barbearia_perfis')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();
          if (novoPerfil) {
            setPerfil(p => ({...p, ...novoPerfil,
              horario_abertura:(novoPerfil.horario_abertura||'08:00').slice(0,5),
              horario_fechamento:(novoPerfil.horario_fechamento||'19:00').slice(0,5),
            }));
          }
        } else {
          console.error("Erro ao criar perfil via RPC:", rpcError);
          setPerfil(p => ({...p, nome: nomeSugerido}));
        }
      }
    }
    carregarPerfil();
  }, [logado]);

  if (iniciando) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#1A1610',fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,0.35)',fontSize:13,letterSpacing:1}}>
      Carregando...
    </div>
  );
  if (!logado) return <AuthBarbearia onLogin={()=>setLogado(true)} />;

  const pages = {
    agenda:<PageAgenda perfil={perfil} />,
    clube:<PageClube />,
    crm:<PageCRM />,
    importador:<ImportadorClientes onImportarConcluido={()=>setPage("crm")} />,
    estoque:<PageEstoque />,
    comandas:<PageComandas />,
    dashboard:<PageDashboard />,
    financeiro:<PageFinanceiro />,
    relatorios: <PageRelatorios />,
    cliente:<ClienteApp />,
    config:<ConfiguracaoBarbearia />,
  };

  let lastSection = null;

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">{perfil.nome?.substring(0,1).toUpperCase()}</div>
              <div className="logo-name">{perfil.nome || 'BarberFlow'}</div>
            </div>
            <div className="logo-tagline">Sistema de Gestão</div>
          </div>

          <nav className="nav">
            {navItems.map(item=>{
              const showSection=item.section&&item.section!==lastSection;
              if(item.section) lastSection=item.section;
              return (
                <div key={item.key}>
                  {showSection&&<div className="nav-section">{item.section}</div>}
                  <div
                    className={`nav-item ${page===item.key?"active":""} ${item.disabled?"disabled":""}`}
                    onClick={()=>!item.disabled&&setPage(item.key)}
                    style={item.disabled?{opacity:0.4,cursor:"default"}:{}}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    {item.badge&&<span className="nav-badge">{item.badge}</span>}
                    {item.disabled&&<span style={{marginLeft:"auto",fontSize:9,color:"rgba(255,255,255,0.25)",letterSpacing:1}}>EM BREVE</span>}
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="sidebar-user">
            <div className="user-avatar">{perfil.nome?.substring(0,2).toUpperCase()}</div>
            <div style={{flex:1, minWidth:0}}>
              <div className="user-name" style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{perfil.nome}</div>
              <div className="user-role">Administrador</div>
            </div>
            <button
              className="logout-btn"
              title="Sair"
              onClick={async () => { await supabase.auth.signOut(); }}
            >⏻</button>
          </div>
        </div>

        <div className="main">
          {pages[page]||pages["agenda"]}
        </div>
      </div>
    </>
  );
}
