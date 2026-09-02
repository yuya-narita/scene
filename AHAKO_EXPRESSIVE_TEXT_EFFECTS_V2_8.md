# AHAKO EXPRESSIVE TEXT EFFECTS V2.8

## iPhone audio transport fix

- Ending SE no longer attempts to start on `pointerdown` and then races the final `click`.
- ScenePlayerCore now keeps a reusable bank of one-shot media elements.
- The one-shot bank is silently pre-authorized from the trusted START gesture, so later Scene SE and Ending SE can reuse already-authorized media elements on iPhone.
- AUTO explicitly pre-authorizes future BGM and Ambient transport elements, plus the reusable one-shot bank, from the trusted AUTO-button click before timer-driven Scene advances begin.
- AUTO no longer depends on creating a brand-new `Audio()` element after user activation has expired.
- Scene 1 persistent audio is not disturbed by the prewarm step; START primes one-shots only, then Scene 1 BGM/Ambient starts normally.
- V2.7 graceful exit fade remains unchanged.

## Files changed

- `scene-player-core.js`
- `studio/scene-player-core.js`
- `player-test/scene-player-core.js`

No Splitter / Admin / Privacy changes.
