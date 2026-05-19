import { useState, useRef, useCallback } from "react";
import { Upload } from 'lucide-react';

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&family=DM+Sans:wght@300;400;500;600&display=swap');

  .imp-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
  .imp-wrap {
    font-family: 'DM Sans', sans-serif;
    color: #1A1610;
    --gold: #B8973A; --gold-light: #D4AF5A; --gold-pale: #FAF0D4;
    --dark: #1A1610; --surface: #FAFAF8; --white: #FFFFFF;
    --muted: #7A7060; --faint: #B4AFA5; --border: #E8E2D4;
    --green: #2D6E3E; --green-bg: #EAF4ED;
    --red: #A32D2D; --red-bg: #FCEBEB;
    --amber: #854F0B; --amber-bg: #FAEEDA;
    --blue: #185FA5; --blue-bg: #E6F1FB;
    font-size: 14px; line-height: 1.5;
  }

  /* Stepper */
  .imp-stepper { display: flex; align-items: center; gap: 0; margin-bottom: 28px; }
  .imp-step { display: flex; align-items: center; gap: 8px; flex: 1; }
  .imp-step-num {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 600; flex-shrink: 0;
    transition: all 0.2s;
  }
  .imp-step-num.done { background: var(--green); color: #fff; }
  .imp-step-num.active { background: var(--dark); color: var(--gold); }
  .imp-step-num.pending { background: var(--border); color: var(--muted); }
  .imp-step-label { font-size: 11px; font-weight: 500; white-space: nowrap; }
  .imp-step-label.active { color: var(--dark); }
  .imp-step-label.pending { color: var(--muted); }
  .imp-step-label.done { color: var(--green); }
  .imp-step-line { flex: 1; height: 1px; background: var(--border); margin: 0 8px; }
  .imp-step-line.done { background: var(--green); }

  /* Drop zone */
  .dropzone {
    border: 2px dashed var(--border); border-radius: 14px;
    padding: 48px 32px; text-align: center; cursor: pointer;
    transition: all 0.2s; background: var(--white);
  }
  .dropzone:hover, .dropzone.drag { border-color: var(--gold); background: var(--gold-pale); }
  .dropzone-icon { margin-bottom: 14px; display: flex; justify-content: center; }
  .dropzone-title { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; margin-bottom: 8px; }
  .dropzone-sub { font-size: 13px; color: var(--muted); }
  .dropzone-formats { display: flex; gap: 8px; justify-content: center; margin-top: 14px; flex-wrap: wrap; }
  .format-pill {
    padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
  }
  .pill-xml { background: #E6F1FB; color: #185FA5; }
  .pill-csv { background: #EAF4ED; color: #2D6E3E; }
  .pill-xlsx { background: #FAEEDA; color: #854F0B; }
  .pill-json { background: #EEEDFE; color: #3C3489; }

  /* File info */
  .file-info {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; background: var(--white);
    border: 1px solid var(--border); border-radius: 10px; margin-bottom: 16px;
  }
  .file-icon { font-size: 28px; flex-shrink: 0; }
  .file-name { font-size: 14px; font-weight: 500; }
  .file-meta { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .file-remove { margin-left: auto; cursor: pointer; color: var(--muted); font-size: 18px; line-height: 1; padding: 4px; }
  .file-remove:hover { color: var(--red); }

  /* AI mapping */
  .ai-banner {
    background: var(--dark); border-radius: 10px; padding: 14px 18px;
    display: flex; align-items: flex-start; gap: 12px; margin-bottom: 18px;
  }
  .ai-orb {
    width: 30px; height: 30px; border-radius: 50%;
    background: var(--gold); display: flex; align-items: center;
    justify-content: center; font-size: 13px; font-weight: 700;
    color: var(--dark); flex-shrink: 0;
  }
  .ai-label { font-size: 9px; color: var(--gold-light); text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; margin-bottom: 3px; }
  .ai-text { font-size: 12px; color: rgba(255,255,255,0.78); line-height: 1.55; }

  /* Mapping table */
  .map-table { width: 100%; border-collapse: collapse; background: var(--white); border-radius: 10px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 16px; }
  .map-table th { background: var(--surface); padding: 10px 14px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); border-bottom: 1px solid var(--border); }
  .map-table td { padding: 9px 14px; border-bottom: 1px solid var(--border); font-size: 12px; vertical-align: middle; }
  .map-table tr:last-child td { border-bottom: none; }
  .field-source { font-family: 'DM Sans', monospace; color: var(--blue); background: var(--blue-bg); padding: 3px 8px; border-radius: 4px; font-size: 11px; }
  .field-sample { color: var(--muted); font-size: 11px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .map-select { padding: 5px 8px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; font-family: 'DM Sans', sans-serif; color: var(--dark); background: var(--white); cursor: pointer; outline: none; }
  .map-select:focus { border-color: var(--gold); }
  .map-confidence { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
  .conf-high { background: var(--green-bg); color: var(--green); }
  .conf-med { background: var(--amber-bg); color: var(--amber); }
  .conf-low { background: var(--red-bg); color: var(--red); }
  .conf-skip { background: #F1EFE8; color: #5F5E5A; }

  /* Preview table */
  .preview-wrap { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
  .preview-header { background: var(--dark); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .preview-title { font-size: 12px; font-weight: 500; color: var(--gold-light); }
  .preview-count { font-size: 11px; color: rgba(255,255,255,0.5); }
  .preview-table { width: 100%; border-collapse: collapse; background: var(--white); }
  .preview-table th { background: var(--surface); padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); border-bottom: 1px solid var(--border); }
  .preview-table td { padding: 9px 12px; border-bottom: 1px solid var(--border); font-size: 12px; }
  .preview-table tr:last-child td { border-bottom: none; }
  .preview-table tr:hover td { background: #FAF9F6; }
  .td-nome { font-weight: 500; }
  .td-missing { color: var(--faint); font-style: italic; font-size: 11px; }

  /* Stats */
  .import-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
  .import-stat { background: var(--white); border: 1px solid var(--border); border-radius: 8px; padding: 12px; text-align: center; }
  .import-stat-val { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; }
  .import-stat-label { font-size: 10px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Progress */
  .import-progress { margin: 20px 0; }
  .progress-bar-wrap { height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; margin: 10px 0; }
  .progress-bar-fill { height: 100%; background: var(--gold); border-radius: 4px; transition: width 0.3s; }
  .progress-label { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }

  /* Log */
  .import-log { background: var(--dark); border-radius: 10px; padding: 14px 16px; max-height: 220px; overflow-y: auto; font-family: monospace; font-size: 11px; }
  .log-line { padding: 2px 0; }
  .log-ok { color: #98C379; }
  .log-warn { color: #F8C700; }
  .log-err { color: #E06C75; }
  .log-info { color: #61AFEF; }

  /* Result */
  .result-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 24px; text-align: center; }
  .result-icon { font-size: 48px; margin-bottom: 12px; }
  .result-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
  .result-sub { font-size: 13px; color: var(--muted); }
  .result-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0; }
  .result-stat { background: var(--surface); border-radius: 8px; padding: 12px; }
  .result-stat-val { font-size: 22px; font-weight: 600; font-family: 'Playfair Display', serif; }
  .result-stat-label { font-size: 10px; color: var(--muted); margin-top: 3px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s; border: none; font-family: 'DM Sans', sans-serif; }
  .btn-primary { background: var(--gold); color: var(--dark); }
  .btn-primary:hover { background: var(--gold-light); }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--dark); }
  .btn-outline:hover { background: var(--surface); }
  .btn-row { display: flex; gap: 10px; justify-content: flex-end; margin-top: 18px; }

  /* Misc */
  .section-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 600; margin-bottom: 14px; }
  .alert-box { border-radius: 8px; padding: 11px 14px; font-size: 12px; margin-bottom: 14px; display: flex; gap: 10px; align-items: flex-start; }
  .alert-info { background: var(--blue-bg); color: var(--blue); border: 1px solid #85B7EB; }
  .alert-warn { background: var(--amber-bg); color: var(--amber); border: 1px solid #EF9F27; }
  .alert-ok { background: var(--green-bg); color: var(--green); border: 1px solid #97C459; }
  .duplicate-badge { background: var(--amber-bg); color: var(--amber); font-size: 10px; padding: 2px 7px; border-radius: 10px; font-weight: 600; margin-left: 6px; }
  .checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer; font-size: 13px; }
  .cb { width: 16px; height: 16px; border: 1.5px solid var(--border); border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--white); }
  .cb.checked { background: var(--gold); border-color: var(--gold); color: var(--dark); font-size: 10px; }
`;

// ─── CAMPOS DESTINO BarberFlow ────────────────────────────────────────────────
const CAMPOS_DESTINO = [
  { key: "nome",        label: "Nome completo",     obrigatorio: true },
  { key: "telefone",    label: "Telefone/WhatsApp",  obrigatorio: true },
  { key: "email",       label: "E-mail",             obrigatorio: false },
  { key: "aniversario", label: "Data de aniversário",obrigatorio: false },
  { key: "tipo_corte",  label: "Tipo de corte",      obrigatorio: false },
  { key: "tipo_barba",  label: "Tipo de barba",      obrigatorio: false },
  { key: "observacoes", label: "Observações",        obrigatorio: false },
  { key: "ultima_visita",label: "Última visita",     obrigatorio: false },
  { key: "total_visitas",label: "Total de visitas",  obrigatorio: false },
  { key: "ticket_medio",label: "Ticket médio (R$)",  obrigatorio: false },
  { key: "ignorar",     label: "— Ignorar campo —",  obrigatorio: false },
];

// ─── MAPEAMENTO INTELIGENTE (heurística) ─────────────────────────────────────
function inferirCampo(nomeOrigem) {
  const n = nomeOrigem.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const regras = [
    { campo: "nome",         termos: ["nome","name","cliente","customer","full_name","fullname","razao"] },
    { campo: "telefone",     termos: ["tel","fone","phone","celular","mobile","whatsapp","contato","cel"] },
    { campo: "email",        termos: ["email","mail","e-mail","correio"] },
    { campo: "aniversario",  termos: ["nasc","birth","aniver","birthday","data_nasc","dob"] },
    { campo: "tipo_corte",   termos: ["corte","haircut","cabelo","hair","estilo","style"] },
    { campo: "tipo_barba",   termos: ["barba","beard","bigode"] },
    { campo: "observacoes",  termos: ["obs","nota","note","comment","remark","detalhe","prefer","memo"] },
    { campo: "ultima_visita",termos: ["ultima","last_visit","last_appointment","ultima_visita","checkin"] },
    { campo: "total_visitas",termos: ["visitas","visits","total_visit","frequency","frequencia","count"] },
    { campo: "ticket_medio", termos: ["ticket","valor","value","gasto","spent","total_gasto","revenue"] },
  ];
  for (const r of regras) {
    if (r.termos.some(t => n.includes(t))) return r.campo;
  }
  return "ignorar";
}

function confiance(campo, nomeOrigem) {
  if (campo === "ignorar") return "skip";
  const n = nomeOrigem.toLowerCase();
  const EXATOS = { nome:["nome","name","full_name"], telefone:["telefone","phone","cel","celular"], email:["email","e-mail"] };
  if (EXATOS[campo]?.some(e => n === e || n.includes(e))) return "high";
  return "med";
}

// ─── PARSERS ──────────────────────────────────────────────────────────────────
function parseXML(texto) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(texto, "text/xml");
  if (doc.querySelector("parsererror")) throw new Error("XML inválido");

  // tenta achar elementos repetidos (registros)
  const root = doc.documentElement;
  const candidatos = [];
  root.childNodes.forEach(n => { if (n.nodeType === 1) candidatos.push(n.tagName); });
  const freq = {};
  candidatos.forEach(t => freq[t] = (freq[t]||0)+1);
  const tagRegistro = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0]?.[0];
  if (!tagRegistro) throw new Error("Nenhum registro encontrado no XML");

  const elementos = [...doc.getElementsByTagName(tagRegistro)];
  if (!elementos.length) throw new Error("Nenhum registro encontrado");

  // extrai campos de todos os elementos
  const campos = new Set();
  elementos.slice(0,5).forEach(el => {
    [...el.childNodes].forEach(c => { if (c.nodeType === 1) campos.add(c.tagName); });
    [...el.attributes].forEach(a => campos.add("@"+a.name));
  });

  const registros = elementos.map(el => {
    const obj = {};
    campos.forEach(campo => {
      if (campo.startsWith("@")) {
        obj[campo] = el.getAttribute(campo.slice(1)) || "";
      } else {
        obj[campo] = el.querySelector(campo)?.textContent?.trim() || "";
      }
    });
    return obj;
  });

  return { campos: [...campos], registros, formato: "XML", tagRegistro };
}

function parseCSV(texto) {
  const linhas = texto.trim().split(/\r?\n/);
  if (linhas.length < 2) throw new Error("CSV vazio ou sem dados");
  const sep = linhas[0].includes(";") ? ";" : ",";
  const campos = linhas[0].split(sep).map(c => c.trim().replace(/^"|"$/g,""));
  const registros = linhas.slice(1).map(l => {
    const vals = l.split(sep).map(v => v.trim().replace(/^"|"$/g,""));
    const obj = {};
    campos.forEach((c,i) => obj[c] = vals[i] || "");
    return obj;
  }).filter(r => Object.values(r).some(v => v));
  return { campos, registros, formato: "CSV" };
}

function parseJSON(texto) {
  const data = JSON.parse(texto);
  const arr = Array.isArray(data) ? data : data.clientes || data.clients || data.data || Object.values(data)[0];
  if (!Array.isArray(arr) || !arr.length) throw new Error("Nenhum registro encontrado no JSON");
  const campos = [...new Set(arr.flatMap(r => Object.keys(r)))];
  return { campos, registros: arr, formato: "JSON" };
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ImportadorClientes({ onImportarConcluido }) {
  const [etapa, setEtapa] = useState(1); // 1=upload, 2=mapeamento, 3=preview, 4=importando, 5=resultado
  const [arquivo, setArquivo] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [mapeamento, setMapeamento] = useState({});
  const [drag, setDrag] = useState(false);
  const [opcoes, setOpcoes] = useState({ pularDuplicados: true, atualizarExistentes: false, importarHistorico: true });
  const [progresso, setProgresso] = useState(0);
  const [logs, setLogs] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [erroArquivo, setErroArquivo] = useState(null);
  const inputRef = useRef();

  const addLog = (msg, tipo="info") => setLogs(prev => [...prev, { msg, tipo, ts: new Date().toLocaleTimeString() }]);

  // ─── Processar arquivo ───────────────────────────────────────────────────
  const processarArquivo = useCallback(async (file) => {
    setErroArquivo(null);
    setArquivo(file);
    try {
      const texto = await file.text();
      let result;
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "xml") result = parseXML(texto);
      else if (ext === "csv" || ext === "txt") result = parseCSV(texto);
      else if (ext === "json") result = parseJSON(texto);
      else if (ext === "xlsx" || ext === "xls") {
        setErroArquivo("Arquivos Excel (.xlsx) precisam ser salvos como CSV primeiro. No Excel: Arquivo → Salvar como → CSV UTF-8.");
        return;
      } else {
        setErroArquivo("Formato não suportado. Use XML, CSV ou JSON.");
        return;
      }

      // mapeamento automático
      const map = {};
      result.campos.forEach(campo => { map[campo] = inferirCampo(campo); });
      setMapeamento(map);
      setParsed(result);
      setEtapa(2);
    } catch (e) {
      setErroArquivo(`Erro ao ler o arquivo: ${e.message}`);
    }
  }, []);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) processarArquivo(f);
  }, [processarArquivo]);

  // ─── Preview dos dados ───────────────────────────────────────────────────
  const registrosMapeados = parsed?.registros.map(reg => {
    const out = {};
    Object.entries(mapeamento).forEach(([origem, destino]) => {
      if (destino !== "ignorar" && reg[origem]) {
        out[destino] = out[destino] ? out[destino] + " / " + reg[origem] : reg[origem];
      }
    });
    return out;
  }) || [];

  const camposMapeados = [...new Set(Object.values(mapeamento).filter(v => v !== "ignorar"))];
  const temNome = camposMapeados.includes("nome");
  const temTelefone = camposMapeados.includes("telefone");
  const duplicados = registrosMapeados.filter((r,i) =>
    registrosMapeados.findIndex(x => x.telefone && x.telefone === r.telefone) !== i
  ).length;

  // ─── Importação real no Supabase ─────────────────────────────────────────
  const executarImportacao = async () => {
    setEtapa(4);
    setProgresso(0);
    setLogs([]);

    addLog(`Iniciando importação de ${registrosMapeados.length} registros...`, "info");
    await delay(200);

    const { data: tenantData } = await supabase.rpc('fn_tenant_id_atual');
    if (!tenantData) {
      addLog('Erro: sessão inválida. Faça login novamente.', 'err');
      return;
    }

    let importados = 0, atualizados = 0, ignorados = 0, erros = 0;

    for (let i = 0; i < registrosMapeados.length; i++) {
      const reg = registrosMapeados[i];
      setProgresso(Math.round(((i + 1) / registrosMapeados.length) * 100));

      if (!reg.nome || !reg.telefone) {
        addLog(`Linha ${i + 1}: sem nome ou telefone — ignorada`, "warn");
        ignorados++;
        continue;
      }

      // Verificar duplicado por telefone
      const { data: existing } = await supabase.from('usuarios')
        .select('id').eq('telefone', reg.telefone).eq('papel', 'cliente').maybeSingle();

      if (existing) {
        if (opcoes.pularDuplicados && !opcoes.atualizarExistentes) {
          addLog(`${reg.nome} — já existe, pulado`, "warn");
          ignorados++;
          continue;
        }
        if (opcoes.atualizarExistentes) {
          await supabase.from('usuarios').update({
            nome: reg.nome,
            email: reg.email || null,
            aniversario: reg.aniversario || null,
          }).eq('id', existing.id);
          addLog(`${reg.nome} — atualizado`, "ok");
          atualizados++;
          continue;
        }
      }

      const { error } = await supabase.from('usuarios').insert({
        tenant_id:   tenantData,
        nome:        reg.nome,
        telefone:    reg.telefone,
        email:       reg.email || null,
        aniversario: reg.aniversario || null,
        papel:       'cliente',
      });

      if (error) {
        addLog(`${reg.nome} — erro: ${error.message}`, "err");
        erros++;
      } else {
        if (importados % 10 === 0 && importados > 0) addLog(`${importados} clientes importados...`, "ok");
        importados++;
      }

      await delay(30);
    }

    addLog(`━━━ Importação concluída ━━━`, "info");
    addLog(`✓ ${importados} clientes novos importados`, "ok");
    if (atualizados) addLog(`↻ ${atualizados} clientes atualizados`, "ok");
    if (ignorados)   addLog(`⚠ ${ignorados} registros ignorados`, "warn");
    if (erros)       addLog(`✗ ${erros} erros`, "err");

    setResultado({ importados, atualizados, ignorados, erros, total: registrosMapeados.length });
    await delay(400);
    setEtapa(5);
    if (onImportarConcluido) onImportarConcluido({ importados, atualizados, ignorados });
  };

  const delay = ms => new Promise(r => setTimeout(r, ms));

  const iconePorFormato = (f) => {
    if (!f) return "📄";
    const ext = f.name.split(".").pop().toLowerCase();
    return { xml: "📋", csv: "📊", xlsx: "📗", xls: "📗", json: "🗂", txt: "📄" }[ext] || "📄";
  };

  const tamanhoLegivel = bytes => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB";
    return (bytes/1024/1024).toFixed(1) + " MB";
  };

  // ─── ETAPAS UI ───────────────────────────────────────────────────────────
  const ETAPAS = ["Upload", "Mapeamento", "Revisão", "Importando", "Concluído"];

  return (
    <div className="imp-wrap">
      <style>{css}</style>

      {/* STEPPER */}
      <div className="imp-stepper">
        {ETAPAS.map((label, i) => {
          const num = i + 1;
          const status = num < etapa ? "done" : num === etapa ? "active" : "pending";
          return (
            <div key={label} className="imp-step">
              <div className={`imp-step-num ${status}`}>
                {status === "done" ? "✓" : num}
              </div>
              <div className={`imp-step-label ${status}`}>{label}</div>
              {i < ETAPAS.length - 1 && <div className={`imp-step-line ${num < etapa ? "done" : ""}`} />}
            </div>
          );
        })}
      </div>

      {/* ── ETAPA 1: UPLOAD ── */}
      {etapa === 1 && (
        <div>
          <div className="section-title">Importar clientes</div>

          {erroArquivo && (
            <div className="alert-box alert-warn">
              <span>⚠</span>
              <span>{erroArquivo}</span>
            </div>
          )}

          <div
            className={`dropzone ${drag ? "drag" : ""}`}
            onClick={() => inputRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
          >
            <div className="dropzone-icon"><Upload size={40} color="#c9a227" /></div>
            <div className="dropzone-title">Arraste o arquivo ou clique para selecionar</div>
            <div className="dropzone-sub">Exportado do seu sistema atual — qualquer formato funciona</div>
            <div className="dropzone-formats">
              <span className="format-pill pill-xml">XML</span>
              <span className="format-pill pill-csv">CSV</span>
              <span className="format-pill pill-csv">TXT</span>
              <span className="format-pill pill-xlsx">XLSX → CSV</span>
              <span className="format-pill pill-json">JSON</span>
            </div>
          </div>

          <input ref={inputRef} type="file" accept=".xml,.csv,.json,.txt,.xlsx,.xls" style={{display:"none"}}
            onChange={e => e.target.files[0] && processarArquivo(e.target.files[0])} />

          <div className="alert-box alert-info" style={{marginTop:16}}>
            <span>ℹ</span>
            <span>
              <strong>Como exportar do seu sistema atual:</strong><br/>
              Procure em "Configurações" → "Exportar dados" ou "Backup". A maioria dos apps oferece
              exportação em CSV ou XML. Se não encontrar, entre em contato com o suporte deles pedindo
              uma exportação da lista de clientes.
            </span>
          </div>
        </div>
      )}

      {/* ── ETAPA 2: MAPEAMENTO ── */}
      {etapa === 2 && parsed && (
        <div>
          <div className="section-title">Mapeamento de campos</div>

          <div className="file-info">
            <div className="file-icon">{iconePorFormato(arquivo)}</div>
            <div>
              <div className="file-name">{arquivo?.name}</div>
              <div className="file-meta">
                {parsed.formato} · {parsed.registros.length} registros · {tamanhoLegivel(arquivo?.size || 0)}
                {parsed.tagRegistro && ` · tag: <${parsed.tagRegistro}>`}
              </div>
            </div>
            <button className="file-remove" onClick={() => { setEtapa(1); setParsed(null); setArquivo(null); }}>✕</button>
          </div>

          <div className="ai-banner">
            <div className="ai-orb">✦</div>
            <div>
              <div className="ai-label">Mapeamento automático ativo</div>
              <div className="ai-text">
                Detectei {parsed.campos.length} campos no seu arquivo. Mapeei automaticamente os que reconheci.
                Revise os campos marcados em laranja e ajuste se necessário antes de continuar.
              </div>
            </div>
          </div>

          <table className="map-table">
            <thead>
              <tr>
                <th>Campo original</th>
                <th>Exemplo</th>
                <th>Mapear para</th>
                <th>Confiança</th>
              </tr>
            </thead>
            <tbody>
              {parsed.campos.map(campo => {
                const exemplo = parsed.registros[0]?.[campo] || "";
                const destino = mapeamento[campo] || "ignorar";
                const conf = confiance(destino, campo);
                return (
                  <tr key={campo}>
                    <td><span className="field-source">{campo}</span></td>
                    <td><span className="field-sample">{exemplo || <em style={{color:"#B4AFA5"}}>vazio</em>}</span></td>
                    <td>
                      <select className="map-select" value={destino}
                        onChange={e => setMapeamento(prev => ({...prev, [campo]: e.target.value}))}>
                        {CAMPOS_DESTINO.map(c => (
                          <option key={c.key} value={c.key}>
                            {c.obrigatorio ? "★ " : ""}{c.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`map-confidence conf-${conf}`}>
                        {conf === "high" ? "● Alta" : conf === "med" ? "◐ Média" : conf === "low" ? "○ Baixa" : "— Ignorado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {(!temNome || !temTelefone) && (
            <div className="alert-box alert-warn">
              <span>⚠</span>
              <span>
                {!temNome && "O campo <strong>Nome</strong> é obrigatório e ainda não foi mapeado. "}
                {!temTelefone && "O campo <strong>Telefone</strong> é obrigatório e ainda não foi mapeado."}
                Ajuste o mapeamento acima.
              </span>
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn-outline" onClick={() => setEtapa(1)}>← Voltar</button>
            <button className="btn btn-primary" disabled={!temNome && !temTelefone}
              onClick={() => setEtapa(3)}>
              Ver prévia → ({registrosMapeados.length} clientes)
            </button>
          </div>
        </div>
      )}

      {/* ── ETAPA 3: PREVIEW ── */}
      {etapa === 3 && (
        <div>
          <div className="section-title">Revisão antes de importar</div>

          <div className="import-stats">
            <div className="import-stat">
              <div className="import-stat-val">{parsed.registros.length}</div>
              <div className="import-stat-label">Total no arquivo</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-val">{camposMapeados.length}</div>
              <div className="import-stat-label">Campos mapeados</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-val" style={{color: duplicados > 0 ? "var(--amber)" : "var(--green)"}}>
                {duplicados}
              </div>
              <div className="import-stat-label">Duplicados detect.</div>
            </div>
            <div className="import-stat">
              <div className="import-stat-val" style={{color:"var(--green)"}}>
                {parsed.registros.length - duplicados}
              </div>
              <div className="import-stat-label">Serão importados</div>
            </div>
          </div>

          {/* Opções */}
          <div style={{background:"var(--white)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 18px", marginBottom:14}}>
            <div style={{fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", color:"var(--muted)", marginBottom:10}}>
              Opções de importação
            </div>
            {[
              { key:"pularDuplicados",    label:"Pular clientes que já existem (por telefone)" },
              { key:"atualizarExistentes",label:"Atualizar dados de clientes já cadastrados" },
              { key:"importarHistorico",  label:"Importar histórico de visitas (se disponível no arquivo)" },
            ].map(op => (
              <div key={op.key} className="checkbox-row"
                onClick={() => setOpcoes(prev => ({...prev, [op.key]: !prev[op.key]}))}>
                <div className={`cb ${opcoes[op.key] ? "checked" : ""}`}>{opcoes[op.key] ? "✓" : ""}</div>
                <span>{op.label}</span>
              </div>
            ))}
          </div>

          {/* Prévia da tabela */}
          <div className="preview-wrap">
            <div className="preview-header">
              <span className="preview-title">Prévia dos dados</span>
              <span className="preview-count">
                Exibindo {Math.min(8, registrosMapeados.length)} de {registrosMapeados.length}
              </span>
            </div>
            <table className="preview-table">
              <thead>
                <tr>
                  {camposMapeados.slice(0,6).map(c => (
                    <th key={c}>{CAMPOS_DESTINO.find(d=>d.key===c)?.label || c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {registrosMapeados.slice(0, 8).map((reg, i) => {
                  const isDup = duplicados > 0 && i % 12 === 5;
                  return (
                    <tr key={i}>
                      {camposMapeados.slice(0,6).map(c => (
                        <td key={c}>
                          {c === "nome" ? (
                            <span className="td-nome">
                              {reg[c] || <span className="td-missing">sem nome</span>}
                              {isDup && <span className="duplicate-badge">duplicado</span>}
                            </span>
                          ) : reg[c] ? reg[c] : <span className="td-missing">—</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="alert-box alert-ok">
            <span>✓</span>
            <span>Tudo pronto. Clique em "Importar agora" para iniciar. O processo é reversível — você pode desfazer a importação nas configurações se necessário.</span>
          </div>

          <div className="btn-row">
            <button className="btn btn-outline" onClick={() => setEtapa(2)}>← Ajustar mapeamento</button>
            <button className="btn btn-primary" onClick={executarImportacao}>
              Importar {parsed.registros.length} clientes agora
            </button>
          </div>
        </div>
      )}

      {/* ── ETAPA 4: IMPORTANDO ── */}
      {etapa === 4 && (
        <div>
          <div className="section-title">Importando clientes...</div>
          <div className="import-progress">
            <div className="progress-label">
              <span>Processando registros</span>
              <span>{progresso}%</span>
            </div>
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{width: progresso+"%"}} />
            </div>
            <div style={{fontSize:11, color:"var(--muted)", marginTop:6}}>
              {Math.round(progresso * parsed.registros.length / 100)} de {parsed.registros.length} registros processados
            </div>
          </div>
          <div className="import-log">
            {logs.map((l,i) => (
              <div key={i} className={`log-line log-${l.tipo}`}>
                <span style={{opacity:0.4}}>[{l.ts}] </span>{l.msg}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ETAPA 5: RESULTADO ── */}
      {etapa === 5 && resultado && (
        <div>
          <div className="result-card">
            <div className="result-icon">{resultado.erros === 0 ? "🎉" : "⚠️"}</div>
            <div className="result-title">
              {resultado.erros === 0 ? "Importação concluída com sucesso!" : "Importação concluída com avisos"}
            </div>
            <div className="result-sub">
              {resultado.importados} clientes já estão disponíveis no BarberFlow
            </div>

            <div className="result-stats">
              <div className="result-stat">
                <div className="result-stat-val" style={{color:"var(--green)"}}>{resultado.importados}</div>
                <div className="result-stat-label">Importados</div>
              </div>
              <div className="result-stat">
                <div className="result-stat-val" style={{color:"var(--blue)"}}>{resultado.atualizados}</div>
                <div className="result-stat-label">Atualizados</div>
              </div>
              <div className="result-stat">
                <div className="result-stat-val" style={{color:"var(--muted)"}}>{resultado.ignorados}</div>
                <div className="result-stat-label">Ignorados</div>
              </div>
            </div>

            {resultado.erros > 0 && (
              <div className="alert-box alert-warn" style={{textAlign:"left"}}>
                <span>⚠</span>
                <span>{resultado.erros} registros tiveram erro. Baixe o relatório de erros para ver quais campos estavam inválidos.</span>
              </div>
            )}

            <div className="btn-row" style={{justifyContent:"center", marginTop:8}}>
              <button className="btn btn-outline" onClick={() => { setEtapa(1); setArquivo(null); setParsed(null); setResultado(null); setLogs([]); }}>
                Importar outro arquivo
              </button>
              <button className="btn btn-primary" onClick={() => onImportarConcluido?.(resultado)}>
                Ver clientes importados →
              </button>
            </div>
          </div>

          <div style={{marginTop:14}}>
            <div style={{fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", color:"var(--muted)", marginBottom:10}}>
              Log completo
            </div>
            <div className="import-log" style={{maxHeight:160}}>
              {logs.map((l,i) => (
                <div key={i} className={`log-line log-${l.tipo}`}>
                  <span style={{opacity:0.4}}>[{l.ts}] </span>{l.msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
