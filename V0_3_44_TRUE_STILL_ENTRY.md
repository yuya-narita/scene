# v0.3.44 — True still entry

- `presentation.entryMotion: "still"` now uses a dedicated render path.
- The incoming Scene is pinned to its final coordinate before reveal and is excluded from whitespace/landing geometry transitions.
- Only previous stacked Scenes move to their new positions.
- Inner text effects (blur/fade/typewriter/etc.) still run normally.
- Applied identically to Public Player Core and Studio Preview Core.
