# Studio v1.12 — Cover audio isolation

Studio Preview now treats Cover as outside the Scene timeline.

- `load()` may render Scene 1 underneath Cover for visual preparation.
- That preload pass uses `_audioRenderMode = "cover"`.
- BGM / Ambient / SE are not executed during that pass.
- `はじめる` calls `_beginFromCover()`, switches to `restore`, and Scene 1 audio begins then.
- No Scene Format v1 fields changed.
