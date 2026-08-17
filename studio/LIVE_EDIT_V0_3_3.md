# Live Edit v0.3.3

- Fixed the tucked cursor toolbox on iPhone Safari by handling controls on `touchstart` / `mousedown` before contenteditable blur.
- Repaired malformed CSS from prior incremental patches where literal `\\n` sequences had been written into the stylesheet.
- Empty Scene hit target and "タップして入力" guide now receive their intended size/pointer styles.
- Re-checks the empty Scene target when History closes.
