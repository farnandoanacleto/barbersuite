# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # dev server on port 3000 (auto-opens browser)
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview the production build locally
```

No test suite is configured.

Required environment variables (create a `.env` file at the root):
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Architecture

BarberFlow is a React 19 + Vite PWA for premium barbershop management. It uses Supabase for auth, database, and realtime; jsPDF for report exports; and `vite-plugin-pwa` for installability.

### Navigation model

There is **no router library**. `App.jsx` holds a `page` state string and renders the correct page component via a lookup object (lines ~1600). Navigation happens by calling `setPage(key)` from sidebar nav items defined in the `navItems` array (~line 1511).

### Two separate UIs in one codebase

- **Barber admin dashboard** — `src/App.jsx` (the main shell + most pages as local functions) and `src/pages/` (heavier pages extracted as separate files).
- **Client-facing mobile app** — `src/pages/ClienteApp.jsx`, rendered when `page === "cliente"`. It simulates a phone frame at 390 px wide.

### Page/module breakdown

| Nav key | Component | Location |
|---|---|---|
| `agenda` | `PageAgenda` | `App.jsx` |
| `clube` | `PageClube` | `App.jsx` |
| `crm` | `PageCRM` | `App.jsx` |
| `dashboard` | `PageDashboard` | `App.jsx` |
| `financeiro` | `PageFinanceiro` | `src/pages/PageFinanceiro.jsx` |
| `relatorios` | `PageRelatorios` | `src/pages/PageRelatorios.jsx` |
| `estoque` | `PageEstoque` | `src/pages/PageEstoque.jsx` |
| `comandas` | `PageComandas` | `src/pages/PageComandas.jsx` |
| `cliente` | `ClienteApp` | `src/pages/ClienteApp.jsx` |
| `config` | `ConfiguracaoBarbearia` | `src/pages/ConfiguracaoBarbearia.jsx` |
| `importador` | `ImportadorClientes` | `src/ImportadorClientes.jsx` |

### Auth flow

`App.jsx` checks for an active Supabase session on mount. If none exists, it renders `AuthBarbearia` (login/signup). After login, it loads the barbershop profile from `barbearia_perfis` filtered by `usuario_id` — this is the multi-tenancy isolation boundary. If no profile exists yet, one is auto-created from `user_metadata`.

### Styling conventions

All CSS is written as template-literal strings injected via `<style>` tags at component mount — there are no CSS modules, no Tailwind, no external stylesheets. Each component declares its own `const css = \`...\`` block and injects it with `<style>{css}</style>`. The design system is a set of CSS custom properties (gold/dark/surface palette) defined in `:root` in `App.jsx` and redeclared locally in page-level components.

### Supabase data layer

- `src/lib/supabase.ts` — exports the singleton `supabase` client, reads URL and anon key from `import.meta.env`.
- `src/lib/financeiro.ts` — typed query helpers for the financial module; all functions return `null` on error (never throw) so components can fall back to mock data silently.
- All other Supabase calls are made inline inside components using the imported `supabase` client directly.

Key tables: `barbearia_perfis`, `agendamentos`, `profissionais`, `usuarios`, `clientes`, `assinaturas`, `planos`, `servicos`, `comandas`, `estoque`, `lista_espera`, `crm_preferencias`.

### `src/screens/` directory

Contains React Native screen files (`HomeScreen.tsx`, `AgendaScreen.tsx`, etc.). These are **not used by the web app** — they are artifacts from a parallel mobile project. Do not import them into web pages.
