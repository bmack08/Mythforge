# Story IDE Feature Toggles and Endpoints

This project ships Story IDE features behind environment flags so you can enable them safely and incrementally.

## Prerequisites
- OPENAI_API_KEY must be set for any OpenAI-backed features (assistant, embeddings).
- Models:
  - STORY_IDE_MODEL: default is gpt-4o-mini (or your preferred chat model)
  - EMBED_MODEL: default is text-embedding-3-large

## Phase 2: Retrieval-Augmented Generation (RAG)
Flags
- STORY_IDE_USE_RAG=1 to include retrieved context in assistant requests
- STORY_IDE_AUTOINDEX=1 to auto-index after a new version is created

Endpoints
- POST /api/story/index/:brewId { fullText? }
- POST /api/story/retrieve/:brewId { query, k? }

Notes
- Uses StoryChunk table via Sequelize; embeddings are stored per chunk.

## Phase 3: Knowledge Graph
Flags
- STORY_IDE_AUTOGRAPH=1 to auto-process graph after a new version

Endpoints
- POST /api/story/graph/process/:brewId { fullText?, title? }
- GET  /api/story/graph/:brewId
- GET  /api/story/graph/:brewId/canon

Notes
- Stores data in server/services/story-ide/knowledge.db (sqlite). Schema auto-initializes.

## Phase 4: JSON/Tool Mode
Flags
- STORY_IDE_JSON_MODE=1 to prefer a structured JSON response from the assistant
- STORY_IDE_AUTOVERSION=1 optional placeholder for future auto-versioning

Endpoint
- POST /api/story-ide { message, documentText?, metadata?, references? }

Notes
- Minimal tool registry: create_section and apply_patch (no-op server-side; clients apply patches and then call versioning).

## Phases 5–7 (Env-gated stubs)
Flags
- MW_PHASE5_ENABLED=1 enables Budget Engine routes
- MW_PHASE6_ENABLED=1 enables Encounter/NPC routes
- MW_PHASE7_ENABLED=1 enables Content Validation routes

Endpoints
- POST /api/phase5/budget/compute { partySize, partyLevel, difficulty, ... }
- POST /api/phase6/encounter/build { spec }
- POST /api/phase6/npc/generate { prompt }
- POST /api/phase7/validate/content { content, checks }

Runtime caveats
- These services are authored in TypeScript (.ts). To run them without precompilation you must:
  1) transpile to JS ahead of time, or
  2) use a runtime loader (e.g., tsx or ts-node/register) so dynamic imports of .ts work.
- By default, the flags are OFF to avoid runtime errors in environments without a TS loader.

## Legacy Save Compatibility
- The editor issues PUT /api/update/:editId with a gzipped JSON body. The server provides a gzip-aware route to handle this and respond with { googleId, editId, shareId, version }.

## Quick smoke
- Ensure Node 20+ per package.json.
- Verify server boots and routes are reachable; for a very quick check, a node smoke task is included in VS Code (node - lint quick check).

---
If you enable a flag and hit a runtime error, double-check OPENAI_API_KEY, model names, and TypeScript runtime setup for Phases 5–7.
