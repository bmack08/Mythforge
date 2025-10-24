# Copilot instructions for Mythforge (Homebrewery-based)

This repo is a modernized fork of Homebrewery with AI features (Mythwright/Mythforge). It’s a Node.js ESM app with an Express API, a React client built by Vite, and SQLite via Sequelize. Follow these project-specific rules and patterns to be productive.

## Architecture essentials
- Server: `server/app.js` builds an Express app; `server.js` starts it (port from `config/default.json` → `web_port`, default 8000). For dev proxy flows, use `run-server.js` (API on 3000).
- Client: Vite React app under `client/homebrew`; built to `build/homebrew` with legacy bundle names (`bundle.js`, `bundle.css`) to keep compatibility.
- Data: SQLite through Sequelize (`server/database.js`). Models and associations in `server/models/index.js` (includes legacy `Homebrew` plus Mythforge models like `StoryVersion` and `StoryChunk`). Tests use in-memory DB when `NODE_ENV=test`.
- Config: `server/config.js` uses `nconf` layering: argv/env → `config/${NODE_ENV}.json` → `config/default.json`. Some features also read `.env` (see `server.js`).
- Content format: Brews store TipTap JSON docs (not raw markdown). Legacy strings are converted on read; new writes should send TipTap JSON.

## Dev/build/test workflows (Windows PowerShell)
- Install: `npm install` (postinstall runs `npm run build`).
- Dev UI + API (hot reload):
  - Start API on 3000: `node .\run-server.js` (Vite proxy expects this).
  - Start Vite on 8081: `npm run dev`.
  - UI at http://localhost:8081; API proxied from `/api` → http://localhost:3000.
- All-in-one server: `node .\server.js` serves the built UI at http://localhost:8000 (use after `npm run build`).
- Build: `npm run build` (outputs to `build/homebrew`).
- Tests: `npm test` (Jest). Useful subsets: `npm run test:api-unit`, `npm run test:route`.

## Key APIs and patterns
- Legacy save (compat): `PUT /api/update/:id` accepts gzipped or plain JSON body; updates brew by `editId` or PK. Only use when interoperating with old clients.
- Brew CRUD (TipTap JSON):
  - `POST /api/brews` → { title, text: TipTap doc, renderer, theme, style, description }.
  - `PUT /api/brews/:brewId` works with `editId` or PK; returns normalized shape.
- AI Story IDE: `POST /api/story-ide` accepts `{ message, documentPlain | documentText | document (TipTap JSON), metadata, references }` and returns `{ mode: 'chat'|'patch', ... }`. Patches are unified diffs applied client-side.
- Versioning/RAG (env gated):
  - `POST /api/story/version/:brewId`, `undo`, `redo` (Phase 1).
  - `POST /api/story/index/:brewId`, `retrieve` (Phase 2) uses OpenAI embeddings and `StoryChunk`.
  - Toggle via env: `STORY_IDE_AUTOINDEX`, `STORY_IDE_AUTOGRAPH`, `MW_PHASE5_ENABLED`, `MW_PHASE6_ENABLED`, `MW_PHASE7_ENABLED`.
- Themes: `GET /api/theme/:renderer/:id` returns `{ styles[], snippets[] }` by reading built CSS in `build/themes/**`. Frontend uses snippet ids.

## Conventions that differ from “typical”
- ESM everywhere. Import JSON with `with { type: 'json' }`. No `require()`.
- TipTap doc model is the source of truth for brew text; use `shared/contentAdapter.js` helpers to convert to/from plain text when needed.
- Build artifacts in `build/**` are generated; don’t hand-edit them.
- CORS in `server/app.js` allows specific ports (8000, 3000, 8081). If you add a local dev port, update `corsOptions`.
- Auth is cookie-based JWT (`nc_session`); for local only, `POST /local/login` returns a token—set it as a cookie to simulate login.

## When adding code
- Server routes live in `server/app.js` or modular routers like `server/homebrew.api.js`; wrap async handlers with `express-async-handler`.
- Prefer returning `{ success: boolean, ... }` for API responses, and include specific error messages.
- If you add env-gated features, document the flag name and default in this file and read via `process.env.*` (and/or `.env` when started by `server.js`).
- For data changes, add fields to Sequelize models in `server/models/*.model.js`, wire associations in `server/models/index.js`, then run once to auto-sync.

## Gotchas
- Vite dev proxy targets http://localhost:3000; use `run-server.js` in dev or change `vite.config.js` if you prefer 8000.
- Some OpenAI model families require `max_completion_tokens` instead of `max_tokens`—see `homebrew.api.js` for detection; follow that pattern.
- Theme CSS must exist under `build/themes/<Renderer>/<Theme>/style.css` for the theme bundle API to work; ensure theme build scripts ran.

## Pointers to examples
- Server routing and HTML rendering pipeline: `server/app.js` (uses `client/template.js`).
- Story IDE orchestration and tool execution examples: `server/homebrew.api.js` (see `executeStoryTools`, `orchestrateStoryEdit`).
- Model bootstrap and associations: `server/models/index.js`.

If any part is unclear (dev proxy choice, TipTap doc shape, or env flags), tell me what you’re trying to do, and I’ll clarify or expand these instructions.