# v0.3.45 — Still entry for solo/static render paths

- Fixed `presentation.entryMotion: "still"` still dropping into place when the active Scene uses `presentation.display: "solo"`.
- The same fix also covers load/history/static render paths.
- `flow` behavior is unchanged.
- Public Player and Studio Preview use the same logic.
