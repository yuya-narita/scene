# v0.2.97 — あ□ / Fixed Header / Preview Return

- Header brand changed from `あ箱` to visual mark `あ□` (`あ` Mincho + `□` Sans).
- Shared Easy/Advanced header no longer changes size while scrolling.
- Preview `編集に戻る` hardened for iOS/WebKit: closes on pointer/touch start in capture phase, prevents Player tap fall-through, and is forced above Player layers.
- Existing preview return target and saved scroll-position restoration are retained.
