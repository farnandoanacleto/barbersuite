import { useState } from "react";
import { supabase } from "../lib/supabase";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .ia-page {
    flex: 1;
    overflow-y: auto;
    padding: 32px 28px;
    font-family: 'DM Sans', sans-serif;
    background: #FAFAF8;
    min-height: 0;
  }
  @media (max-width: 768px) {
    .ia-page { padding: 20px 16px; }
  }

  .ia-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .ia-title {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    color: #1A1610;
  }
  .ia-sub {
    font-size: 12px;
    color: #7A7060;
    margin-top: 4px;
  }
  .ia-enterprise-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: linear-gradient(90deg, #B8973A, #D4AF5A);
    color: #1A1610;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 20px;
    margin-top: 6px;
  }

  .ia-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(90deg, #B8973A, #D4AF5A);
    color: #1A1610;
    border: none;
    border-radius: 10px;
    padding: 12px 26px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: opacity 0.18s, transform 0.18s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .ia-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .ia-btn:disabled { opacity: 0.55; cursor: wait; }

  .ia-error {
    background: #FCEBEB;
    border: 1px solid #F09595;
    border-radius: 10px;
    padding: 12px 16px;
    color: #A32D2D;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .ia-empty {
    text-align: center;
    padding: 60px 32px;
    color: #7A7060;
  }
  .ia-empty-icon { font-size: 54px; margin-bottom: 14px; }
  .ia-empty-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 600;
    color: #1A1610;
    margin-bottom: 8px;
  }
  .ia-empty-desc {
    font-size: 13px;
    line-height: 1.7;
    max-width: 420px;
    margin: 0 auto 24px;
  }

  .ia-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 18px;
  }
  @media (max-width: 700px) {
    .ia-grid { grid-template-columns: 1fr; }
  }

  .ia-card {
    background: #FFFFFF;
    border: 1px solid #E8E2D4;
    border-radius: 16px;
    padding: 22px;
    box-shadow: 0 1px 3px rgba(26,22,16,0.06);
  }
  .ia-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .ia-card-icon { font-size: 20px; }
  .ia-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 15px;
    font-weight: 600;
    color: #1A1610;
  }
  .ia-card-badge {
    margin-left: auto;
    padding: 3px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .ia-badge-alta { background: #EAF4ED; color: #2D6E3E; }
  .ia-badge-queda { background: #FCEBEB; color: #A32D2D; }
  .ia-badge-estavel { background: #FAF0D4; color: #854F0B; }

  .ia-stats {
    display: flex;
    gap: 10px;
    margin-bottom: 14px;
  }
  .ia-stat-box {
    flex: 1;
    background: #FAF0D4;
    border: 1px solid rgba(184,151,58,0.25);
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
  }
  .ia-stat-val {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: #B8973A;
  }
  .ia-stat-lbl { font-size: 9px; color: #7A7060; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

  .ia-resumo {
    font-size: 14px;
    font-weight: 600;
    color: #1A1610;
    margin-bottom: 8px;
    line-height: 1.5;
  }
  .ia-analise {
    font-size: 12px;
    color: #7A7060;
    line-height: 1.7;
    margin-bottom: 14px;
  }
  .ia-acoes-label {
    font-size: 9px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #B8973A;
    font-weight: 600;
    margin-bottom: 7px;
  }
  .ia-acoes {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .ia-acoes li {
    display: flex;
    align-items: flex-start;
    gap: 7px;
    font-size: 12px;
    color: #5A5245;
    line-height: 1.5;
  }
  .ia-acoes li::before {
    content: '→';
    color: #B8973A;
    flex-shrink: 0;
    font-weight: 600;
  }

  .ia-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .ia-tag-up {
    background: #EAF4ED; color: #2D6E3E;
    padding: 2px 8px; border-radius: 6px;
    font-size: 11px; font-weight: 500;
  }
  .ia-tag-down {
    background: #FCEBEB; color: #A32D2D;
    padding: 2px 8px; border-radius: 6px;
    font-size: 11px; font-weight: 500;
  }

  .ia-risco-list { margin-bottom: 12px; }
  .ia-risco-item {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 4px 0;
    font-size: 12px;
    color: #5A5245;
  }
  .ia-risco-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #A32D2D; flex-shrink: 0;
  }

  .ia-footer {
    font-size: 11px;
    color: #B4AFA5;
    text-align: center;
    margin-top: 18px;
  }

  @keyframes ia-dot-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
    40% { transform: translateY(-5px); opacity: 1; }
  }
  .ia-dot { display: inline-block; animation: ia-dot-bounce 1.2s ease-in-out infinite; }
  .ia-dot:nth-child(2) { animation-delay: 0.15s; }
  .ia-dot:nth-child(3) { animation-delay: 0.3s; }
`;

const STATUS_LABEL = { alta: 'Em alta ↑', queda: 'Em queda ↓', estavel: 'Estável →' };
const STATUS_CLASS = { alta: 'ia-badge-alta', queda: 'ia-badge-queda', estavel: 'ia-badge-estavel' };

export default function PageIAInsights() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [stats, setStats] = useState(null);
  const [erro, setErro] = useState('');
  const [geradoEm, setGeradoEm] = useState('');

  async function gerarInsights() {
    setLoading(true);
    setErro('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão expirada — faça login novamente');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ia-insights`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Erro ao gerar insights');

      setInsights(data.insights);
      setStats(data.stats);
      setGeradoEm(data.gerado_em);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="ia-page">

        <div className="ia-header">
          <div>
            <div className="ia-title">✨ IA Insights</div>
            <div className="ia-sub">Análise inteligente dos seus dados gerada por Claude AI</div>
            <div className="ia-enterprise-badge">✦ Enterprise</div>
          </div>
          <button className="ia-btn" onClick={gerarInsights} disabled={loading}>
            {loading
              ? <><span className="ia-dot">●</span><span className="ia-dot">●</span><span className="ia-dot">●</span>&nbsp;Analisando...</>
              : <>✨ Gerar Insights</>
            }
          </button>
        </div>

        {erro && <div className="ia-error">⚠ {erro}</div>}

        {!insights && !loading && (
          <div className="ia-empty">
            <div className="ia-empty-icon">🧠</div>
            <div className="ia-empty-title">Pronto para analisar sua barbearia</div>
            <div className="ia-empty-desc">
              Clique em "Gerar Insights" para que a IA analise seus agendamentos, clientes e serviços dos últimos 2 meses e entregue recomendações personalizadas para você faturar mais.
            </div>
            <button className="ia-btn" onClick={gerarInsights} style={{ margin: '0 auto', display: 'inline-flex' }}>
              ✨ Gerar meus primeiros insights
            </button>
          </div>
        )}

        {insights && (
          <>
            <div className="ia-grid">

              {/* ── Ticket Médio ── */}
              <div className="ia-card">
                <div className="ia-card-head">
                  <span className="ia-card-icon">💰</span>
                  <span className="ia-card-title">Ticket Médio</span>
                  {insights.ticket_medio?.status && (
                    <span className={`ia-card-badge ${STATUS_CLASS[insights.ticket_medio.status] || 'ia-badge-estavel'}`}>
                      {STATUS_LABEL[insights.ticket_medio.status]}
                    </span>
                  )}
                </div>
                {stats && (
                  <div className="ia-stats">
                    <div className="ia-stat-box">
                      <div className="ia-stat-val">R$ {stats.ticket_atual.toFixed(0)}</div>
                      <div className="ia-stat-lbl">Este mês</div>
                    </div>
                    <div className="ia-stat-box">
                      <div className="ia-stat-val">R$ {stats.ticket_anterior.toFixed(0)}</div>
                      <div className="ia-stat-lbl">Mês anterior</div>
                    </div>
                    <div className="ia-stat-box">
                      <div className="ia-stat-val">{stats.atendimentos_mes}</div>
                      <div className="ia-stat-lbl">Atendimentos</div>
                    </div>
                  </div>
                )}
                <div className="ia-resumo">{insights.ticket_medio?.resumo}</div>
                <div className="ia-analise">{insights.ticket_medio?.analise}</div>
                {insights.ticket_medio?.acoes?.length > 0 && (
                  <>
                    <div className="ia-acoes-label">Ações recomendadas</div>
                    <ul className="ia-acoes">
                      {insights.ticket_medio.acoes.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </>
                )}
              </div>

              {/* ── Clientes em Risco ── */}
              <div className="ia-card">
                <div className="ia-card-head">
                  <span className="ia-card-icon">👥</span>
                  <span className="ia-card-title">Clientes em Risco</span>
                  {stats && (
                    <span className="ia-card-badge ia-badge-queda" style={{ marginLeft: 'auto' }}>
                      {stats.clientes_inativos + stats.assinantes_risco} em risco
                    </span>
                  )}
                </div>
                {stats && (
                  <div className="ia-stats">
                    <div className="ia-stat-box">
                      <div className="ia-stat-val">{stats.clientes_inativos}</div>
                      <div className="ia-stat-lbl">Inativos +30d</div>
                    </div>
                    <div className="ia-stat-box">
                      <div className="ia-stat-val">{stats.assinantes_risco}</div>
                      <div className="ia-stat-lbl">Assinantes risco</div>
                    </div>
                  </div>
                )}
                {stats?.nomes_risco?.length > 0 && (
                  <div className="ia-risco-list">
                    <div className="ia-acoes-label" style={{ marginBottom: 6 }}>Assinantes que podem cancelar</div>
                    {stats.nomes_risco.map((n, i) => (
                      <div key={i} className="ia-risco-item">
                        <div className="ia-risco-dot" />
                        {n} — sem visita há +15 dias
                      </div>
                    ))}
                  </div>
                )}
                <div className="ia-resumo">{insights.clientes_inativos?.resumo}</div>
                <div className="ia-analise">{insights.clientes_inativos?.analise}</div>
                {insights.clientes_inativos?.acoes?.length > 0 && (
                  <>
                    <div className="ia-acoes-label">Ações recomendadas</div>
                    <ul className="ia-acoes">
                      {insights.clientes_inativos.acoes.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </>
                )}
              </div>

              {/* ── Tendência de Serviços ── */}
              <div className="ia-card">
                <div className="ia-card-head">
                  <span className="ia-card-icon">📈</span>
                  <span className="ia-card-title">Tendência de Serviços</span>
                </div>
                {insights.tendencia_servicos?.crescendo?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="ia-acoes-label" style={{ marginBottom: 5 }}>Em crescimento</div>
                    <div className="ia-tags">
                      {insights.tendencia_servicos.crescendo.map((s, i) => (
                        <span key={i} className="ia-tag-up">↑ {s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {insights.tendencia_servicos?.caindo?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div className="ia-acoes-label" style={{ marginBottom: 5 }}>Em queda</div>
                    <div className="ia-tags">
                      {insights.tendencia_servicos.caindo.map((s, i) => (
                        <span key={i} className="ia-tag-down">↓ {s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="ia-resumo">{insights.tendencia_servicos?.resumo}</div>
                <div className="ia-analise">{insights.tendencia_servicos?.analise}</div>
                {insights.tendencia_servicos?.acoes?.length > 0 && (
                  <>
                    <div className="ia-acoes-label">Ações recomendadas</div>
                    <ul className="ia-acoes">
                      {insights.tendencia_servicos.acoes.map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                  </>
                )}
              </div>

            </div>

            {geradoEm && (
              <div className="ia-footer">
                Última análise gerada em {new Date(geradoEm).toLocaleString('pt-BR')}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
