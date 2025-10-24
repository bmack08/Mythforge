## QA status (Mythforge V1)

Date: 2025-10-15

### Summary
- Build: PASS (Vite build succeeds; bundles generated under `build/homebrew`)
- Lint/Stylelint: FAIL (numerous warnings; a handful of errors remain in legacy/temp areas)
- Unit tests (markdown): PASS (basic suites)
- API tests (theme bundle subset): PARTIAL FAIL (Homebrewery upstream fixtures pass, local copies fail due to module path assumptions/mocks)
- Route tests: FAIL (Jest env trips on `server/database.js` path resolution)

### Details
- Build
  - Vite build completed without fatal errors. Themes and assets referenced; CSS/JS bundles present.

- Lint
  - ESLint reports many warnings and several errors, largely in temporary or vendored areas (e.g., temp vitreum). Action: tighten ignore patterns and address actionable errors in app code.

- Tests
  - Markdown/basic parsing tests: PASS.
  - Theme bundle tests: Upstream Homebrewery specs pass in `docs/homebrewery-master/...`; local `server/*.spec.js` fail due to ESM path/mocks (`./homebrew.model.js` not found in our structure) and dist specs expecting different import roots.
  - Routes/static tests: Failing with `TypeError: The "path" argument must be of type string. Received undefined` originating from `server/database.js` when executed under Jest.

### Recent fixes validated
- Preview scrollbar in render pane: Working. Each pane scrolls independently.
- Sticky toolbar no longer overlaps content.
- Server lazy migration for brew text (legacy → TipTap JSON) added; forward-only flow OK.

### New change in this pass
- Enforced a strict two-column layout inside each rendered page by applying `column-count: 2` to `.page > .columnWrapper` and clipping overflow to prevent phantom third columns.

### Known issues / next steps
1) Fix Jest ESM/paths for server tests
   - Make `server/database.js` Jest-safe by guarding `fileURLToPath` usage and defaulting to in-memory storage when `NODE_ENV=test`.
   - Adjust or skip legacy `server/*.spec.js` that assume CommonJS and local models (e.g., `./homebrew.model.js`). Prefer new API tests targeting Sequelize models in `server/models`.

2) Lint noise reduction
   - Update `eslint.config.mjs` to ignore `temp_*`, `docs/**`, and built `server/dist/**` test artifacts. Fix a short list of real errors in app code.

3) Column overflow UX
   - Current enforcement clips overflow after two columns. Longer-term: implement auto-pagination by measured height and insert page breaks in preview (optional “commit breaks”).

4) Asset/theme verification
   - Spot-check a few themes via `GET /api/theme/:renderer/:id` and confirm snippet IDs align with `themes.index.json`.

### Acceptance checklist snapshot
- [x] Build artifacts present and loadable
- [x] Editor/Preview scroll to bottom
- [x] Sticky toolbar behavior OK
- [x] Limit preview to 2 columns (no phantom overflow)
- [ ] All Jest suites green (route + server) — pending
- [ ] Lint baseline healthy — pending
- [ ] Export/print smoke test — pending

— End of report —
