# v0.2.51 — REC progress round-trip in `.scene`

The full `.scene` package now contains an optional Studio-only file:

`studio-state.json`

It stores authoring state separately from Scene Format v1:
- REC next position
- REC recorded count
- next Scene ID as a stable fallback
- selected Advanced Scene position / ID

Scene playback timing itself remains in each Scene's existing `pause` value.
No Studio-only REC metadata is added to `scene.json`.

On import:
- v0.2.51 packages restore REC continuation
- older `.scene` packages without `studio-state.json` still open normally and start REC from 0
- imported work is immediately saved as a new local draft, including the restored REC state

Unchanged:
- Scene Format v1
- Player Core
- Splitter
- media packaging
- publish/unpublish state (publication is intentionally not transferred by `.scene`)
