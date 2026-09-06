# Master / Distribution .scene Phase 1 — v49

## Scope
- Existing Master .scene export remains editable and backward-compatible.
- Added a separate Distribution .scene export from the Easy menu.
- Distribution package omits `studio-state.json`.
- Distribution `scene.json` removes `studio`, `_editorFileName`, `_editorManaged`.
- Existing Master `studio.identity.workId` is copied to top-level `scene.json.workId` and `manifest.json.workId`.
- `manifest.json.packageRole = "distribution"` and `scene.json.package.role = "distribution"`.
- Studio refuses to import Distribution .scene for editing/updating.
- Legacy .scene without `packageRole` remains importable/editable as Master.

## Explicitly NOT implemented yet
- editionId / authorId
- copyId / relayId
- telemetry / RELAY tracking
- signatures / DRM

These are intentionally deferred until Phase 1 passes regression checks.
