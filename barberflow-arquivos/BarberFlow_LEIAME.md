# BarberFlow — Pacote Completo MVP Fase 1

## Ordem de uso no Antigravity

1. COMECE PELO GUIA: abra `BarberFlow_Prompts_Antigravity.docx`
2. Siga as 12 etapas na ordem exata
3. Use os arquivos abaixo conforme o guia indica

---

## Arquivos do projeto (cole no Antigravity)

| Arquivo | Onde colocar | Quando usar |
|---|---|---|
| BarberFlow_MVP.jsx | src/App.jsx | Etapa 2 do guia |
| BarberFlow_supabase.ts | src/lib/supabase.ts | Etapa 3 do guia |
| BarberFlow_ImportadorClientes.jsx | src/ImportadorClientes.jsx | Após setup inicial |

## Banco de dados (execute no Supabase)

| Arquivo | Quando executar |
|---|---|
| BarberFlow_schema.sql | Etapa 8 do guia — cria todas as tabelas |
| BarberFlow_importacao_schema.sql | Depois do schema principal — adiciona importação |

## Documentos de apoio

| Arquivo | Descrição |
|---|---|
| BarberFlow_Prompts_Antigravity.docx | Guia com prompts prontos para o Agent Manager |
| BarberFlow_Guia_Instalacao.docx | Passo a passo de todas as conexões |

---

## Módulos incluídos no MVP

- Agenda inteligente (grade por barbeiro, lista de espera, lembretes WhatsApp)
- Clube de assinatura (4 planos, score de churn, alertas)
- CRM de clientes (preferências, histórico, NPS)
- Dashboard da equipe (ranking, metas, alertas IA)
- Importador universal (XML, CSV, JSON — migração de qualquer sistema)

## Stack técnica

- React 18 + Vite
- Supabase (PostgreSQL + Auth + Realtime)
- Stripe (clube de assinatura recorrente)
- Evolution API (WhatsApp automático)
- Google Antigravity (desenvolvimento)
