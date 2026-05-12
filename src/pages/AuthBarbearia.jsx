import { useState } from "react";
import { supabase } from "../lib/supabase";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .auth * { box-sizing: border-box; margin: 0; padding: 0; }
  .auth {
    font-family: 'DM Sans', sans-serif;
    min-height: 100dvh; display: flex;
    background: #1A1610; position: fixed; inset: 0; z-index: 9999;
  }
  .auth-left {
    flex: 1; background: #1A1610; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 40px;
    border-right: 1px solid rgba(255,255,255,0.06);
  }
  .auth-logo { font-family: 'Playfair Display', serif; font-size: 32px; color: #B8973A; font-weight: 700; margin-bottom: 8px; }
  .auth-tagline { font-size: 13px; color: rgba(255,255,255,0.35); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 48px; }
  .auth-feat { width: 100%; max-width: 320px; }
  .auth-feat-item { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 20px; }
  .auth-feat-icon { font-size: 20px; width: 36px; text-align: center; flex-shrink: 0; }
  .auth-feat-title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); margin-bottom: 2px; }
  .auth-feat-sub { font-size: 11px; color: rgba(255,255,255,0.35); line-height: 1.5; }

  .auth-right {
    width: 500px; background: #FAFAF8; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 40px;
  }
  .auth-card { width: 100%; max-width: 380px; }
  .auth-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; color: #1A1610; margin-bottom: 6px; }
  .auth-sub { font-size: 13px; color: #7A7060; margin-bottom: 28px; }
  .form-group { margin-bottom: 14px; }
  .form-label { display: block; font-size: 11px; font-weight: 600; color: #7A7060; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px; }
  .form-input {
    width: 100%; padding: 10px 13px; border: 1px solid #E8E2D4;
    border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1A1610; background: #fff; outline: none; transition: border-color 0.15s;
  }
  .form-input:focus { border-color: #B8973A; }
  .btn-primary {
    width: 100%; padding: 12px; border-radius: 9px; background: #B8973A;
    color: #1A1610; font-size: 14px; font-weight: 700; border: none;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
    margin-top: 6px;
  }
  .btn-primary:hover { background: #D4AF5A; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
  .divider-line { flex: 1; height: 1px; background: #E8E2D4; }
  .divider-txt { font-size: 11px; color: #B4AFA5; }
  .switch-link { text-align: center; margin-top: 20px; font-size: 13px; color: #7A7060; }
  .switch-link span { color: #B8973A; cursor: pointer; font-weight: 600; }
  .switch-link span:hover { text-decoration: underline; }
  .error-box { background: #FCEBEB; border: 1px solid #F09595; border-radius: 8px; padding: 10px 13px; font-size: 12px; color: #A32D2D; margin-bottom: 14px; }
  .success-box { background: #EAF4ED; border: 1px solid #97C459; border-radius: 8px; padding: 10px 13px; font-size: 12px; color: #2D6E3E; margin-bottom: 14px; }
  .step-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 24px; }
  .step-dot { width: 8px; height: 8px; border-radius: 50%; background: #E8E2D4; transition: background 0.2s; }
  .step-dot.active { background: #B8973A; }
  .step-dot.done { background: #2D6E3E; }
`;

export default function AuthBarbearia({ onLogin }) {
  const [modo, setModo] = useState("login"); // login | cadastro | recuperar
  const [etapa, setEtapa] = useState(1);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // Cadastro
  const [cadNome, setCadNome] = useState("");
  const [cadEmail, setCadEmail] = useState("");
  const [cadSenha, setCadSenha] = useState("");
  const [cadConfirma, setCadConfirma] = useState("");
  const [cadSlug, setCadSlug] = useState("");
  const [cadTelefone, setCadTelefone] = useState("");
  const [cadEndereco, setCadEndereco] = useState("");

  const gerarSlug = (nome) =>
    nome.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 40);

  const handleLogin = async () => {
    if (!loginEmail || !loginSenha) { setErro("Preencha e-mail e senha."); return; }
    setLoading(true); setErro("");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginSenha,
    });

    setLoading(false);
    if (error) {
      setErro("Erro no login: " + error.message);
    } else {
      if (onLogin) onLogin(data.user);
    }
  };

  const handleRecuperarSenha = async () => {
    if (!loginEmail) { setErro("Informe seu e-mail para recuperar a senha."); return; }
    setLoading(true); setErro(""); setSucesso("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail, {
      redirectTo: window.location.origin,
    });

    setLoading(false);
    if (error) {
      setErro("Erro ao enviar e-mail: " + error.message);
    } else {
      setSucesso("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
    }
  };

  const handleCadastroEtapa1 = () => {
    if (!cadNome || !cadEmail || !cadSenha) { setErro("Preencha todos os campos."); return; }
    if (cadSenha.length < 6) { setErro("Senha deve ter mínimo 6 caracteres."); return; }
    if (cadSenha !== cadConfirma) { setErro("As senhas não coincidem."); return; }
    setCadSlug(gerarSlug(cadNome));
    setErro(""); setEtapa(2);
  };

  const handleCadastroFinal = async () => {
    if (!cadSlug) { setErro("O slug é obrigatório."); return; }
    setLoading(true); setErro("");

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cadEmail,
      password: cadSenha,
      options: {
        data: {
          nome_barbearia: cadNome,
          telefone: cadTelefone
        }
      }
    });

    if (authError) {
      setLoading(false);
      setErro("Erro ao criar conta: " + authError.message);
      return;
    }

    // 2. Criar perfil da barbearia
    const { error: profileError } = await supabase.from('barbearia_perfis').insert([{
      usuario_id: authData.user.id,
      nome: cadNome,
      slug: cadSlug,
      telefone: cadTelefone,
      endereco: cadEndereco,
      email: cadEmail
    }]);

    setLoading(false);
    if (profileError) {
      setErro("Conta criada, mas erro ao salvar perfil: " + profileError.message);
    } else {
      setSucesso("Conta criada com sucesso! Você já pode fazer login.");
      setEtapa(3);
    }
  };

  const features = [
    { icon:"📅", title:"Agenda inteligente",    sub:"Agendamentos online, lista de espera e lembretes automáticos" },
    { icon:"♛", title:"Clube de assinatura",    sub:"Planos recorrentes com cobrança automática via Stripe" },
    { icon:"👤", title:"CRM completo",           sub:"Histórico, preferências e score de churn por cliente" },
    { icon:"📊", title:"Dashboard em tempo real",sub:"Ranking de barbeiros, metas e alertas de IA" },
    { icon:"📱", title:"App para o cliente",     sub:"NPS, indicação premiada e gift card digital" },
  ];

  return (
    <div className="auth">
      <style>{css}</style>

      {/* Lado esquerdo */}
      <div className="auth-left">
        <div className="auth-logo">BarberFlow</div>
        <div className="auth-tagline">Sistema de gestão para barbearias premium</div>
        <div className="auth-feat">
          {features.map(f => (
            <div key={f.title} className="auth-feat-item">
              <div className="auth-feat-icon">{f.icon}</div>
              <div>
                <div className="auth-feat-title">{f.title}</div>
                <div className="auth-feat-sub">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lado direito */}
      <div className="auth-right">
        <div className="auth-card">

          {/* LOGIN */}
          {modo === "login" && (
            <>
              <div className="auth-title">Entrar</div>
              <div className="auth-sub">Acesse o painel da sua barbearia</div>
              {erro && <div className="error-box">{erro}</div>}
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" placeholder="seu@email.com"
                  value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Senha</label>
                <input className="form-input" type="password" placeholder="••••••••"
                  value={loginSenha} onChange={e => setLoginSenha(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              </div>
              <button className="btn-primary" onClick={handleLogin} disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
              <div style={{textAlign:'center', marginTop:12}}>
                <span className="text-muted" style={{fontSize:12, cursor:'pointer'}} onClick={() => { setModo("recuperar"); setErro(""); setSucesso(""); }}>Esqueci a senha</span>
              </div>
              <div className="switch-link">
                Ainda não tem conta? <span onClick={() => { setModo("cadastro"); setErro(""); setEtapa(1); }}>Criar conta grátis</span>
              </div>
            </>
          )}

          {/* RECUPERAR SENHA */}
          {modo === "recuperar" && (
            <>
              <div className="auth-title">Recuperar senha</div>
              <div className="auth-sub">Enviaremos um link para o seu e-mail</div>
              {erro && <div className="error-box">{erro}</div>}
              {sucesso && <div className="success-box">{sucesso}</div>}
              
              {!sucesso && (
                <>
                  <div className="form-group">
                    <label className="form-label">E-mail da conta</label>
                    <input className="form-input" type="email" placeholder="seu@email.com"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                  </div>
                  <button className="btn-primary" onClick={handleRecuperarSenha} disabled={loading}>
                    {loading ? "Enviando..." : "Enviar link de recuperação"}
                  </button>
                </>
              )}

              <div className="switch-link">
                <span onClick={() => { setModo("login"); setErro(""); setSucesso(""); }}>← Voltar para o login</span>
              </div>
            </>
          )}

          {/* CADASTRO */}
          {modo === "cadastro" && (
            <>
              <div className="auth-title">
                {etapa === 3 ? "Conta criada! 🎉" : "Criar conta"}
              </div>
              <div className="auth-sub">
                {etapa === 1 && "Dados de acesso da sua barbearia"}
                {etapa === 2 && "Informações da barbearia"}
                {etapa === 3 && "Verifique seu e-mail para confirmar"}
              </div>

              {etapa < 3 && (
                <div className="step-dots">
                  {[1,2].map(s => (
                    <div key={s} className={`step-dot ${etapa > s ? 'done' : etapa === s ? 'active' : ''}`} />
                  ))}
                </div>
              )}

              {erro && <div className="error-box">{erro}</div>}
              {sucesso && <div className="success-box">{sucesso}</div>}

              {etapa === 1 && (
                <>
                  <div className="form-group">
                    <label className="form-label">Nome da barbearia</label>
                    <input className="form-input" placeholder="Ex: Barbearia do João"
                      value={cadNome} onChange={e => setCadNome(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input className="form-input" type="email" placeholder="contato@suabarbearia.com"
                      value={cadEmail} onChange={e => setCadEmail(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Senha</label>
                    <input className="form-input" type="password" placeholder="Mínimo 6 caracteres"
                      value={cadSenha} onChange={e => setCadSenha(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmar senha</label>
                    <input className="form-input" type="password" placeholder="Repita a senha"
                      value={cadConfirma} onChange={e => setCadConfirma(e.target.value)} />
                  </div>
                  <button className="btn-primary" onClick={handleCadastroEtapa1}>
                    Continuar →
                  </button>
                </>
              )}

              {etapa === 2 && (
                <>
                  <div className="form-group">
                    <label className="form-label">URL da barbearia</label>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontSize:12,color:'#7A7060',whiteSpace:'nowrap'}}>barberflow.app/</span>
                      <input className="form-input" placeholder="minha-barbearia"
                        value={cadSlug} onChange={e => setCadSlug(gerarSlug(e.target.value))} />
                    </div>
                    <div style={{fontSize:10,color:'#7A7060',marginTop:4}}>
                      Seus clientes acessam em: barberflow.app/{cadSlug || 'sua-barbearia'}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone / WhatsApp</label>
                    <input className="form-input" placeholder="(00) 00000-0000"
                      value={cadTelefone} onChange={e => setCadTelefone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Endereço</label>
                    <input className="form-input" placeholder="Rua, número — Cidade/UF"
                      value={cadEndereco} onChange={e => setCadEndereco(e.target.value)} />
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn-primary" style={{background:'transparent',border:'1px solid #E8E2D4',color:'#7A7060',flex:1}}
                      onClick={() => setEtapa(1)}>← Voltar</button>
                    <button className="btn-primary" style={{flex:2}} onClick={handleCadastroFinal} disabled={loading}>
                      {loading ? "Criando conta..." : "Criar minha conta"}
                    </button>
                  </div>
                </>
              )}

              {etapa === 3 && (
                <>
                  <div style={{textAlign:'center',padding:'20px 0'}}>
                    <div style={{fontSize:48,marginBottom:12}}>📧</div>
                    <div style={{fontSize:13,color:'#7A7060',lineHeight:1.6}}>
                      Enviamos um link de confirmação para<br/>
                      <strong style={{color:'#1A1610'}}>{cadEmail}</strong>
                    </div>
                  </div>
                  <button className="btn-primary" onClick={() => { setModo("login"); setEtapa(1); setSucesso(""); }}>
                    Ir para o login
                  </button>
                </>
              )}

              {etapa < 3 && (
                <div className="switch-link">
                  Já tem conta? <span onClick={() => { setModo("login"); setErro(""); }}>Entrar</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
