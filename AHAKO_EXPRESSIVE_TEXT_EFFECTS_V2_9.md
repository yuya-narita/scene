# AHAKO EXPRESSIVE TEXT EFFECTS V2.9

## iPhone audio transport correction

- Manual Scene SE no longer reuses the AUTO prewarmed one-shot pool.
  - This prevents a primed/blocked Scene 1 SE from spilling into Scene 2 and overlapping Scene 2 SE.
  - Blocked one-shot SE is now dropped instead of being queued for the reader's next tap.
- Ending SE now has a dedicated preloaded media element.
  - On manual iPhone reading it starts directly from the physical final `pointerdown/touchstart` gesture.
  - No Web Audio node is inserted between that final press and `HTMLMediaElement.play()`.
  - `finish()` remains the visual ending transition and is guarded against double playback.
- AUTO audio start order is corrected.
  - Current BGM/Ambient is restored/started first while the AUTO button click still has trusted user activation.
  - Future paused transports and AUTO one-shots are pre-authorized only after current persistent audio has started.
  - Removed the duplicate prewarm call from the AUTO button handler; `startAuto()` now owns the ordering.
- Existing graceful cover/Player fade-out from V2.7/V2.8 is retained.

## Files changed

- `scene-player-core.js`
- `studio/scene-player-core.js`
- `player-test/scene-player-core.js`

No Splitter / Admin / Privacy changes.
