# AHAKO Expressive Text Effects V2.17

Audio follow-up based on V2.16.

## iPhone fade-in
- Keeps the audible V2.15 stable HTMLAudio source bank.
- For A-Hako-hosted BGM/Ambient only, adds one persistent MediaElementSource -> GainNode graph per stable source.
- Source URLs are never swapped after graph creation.
- Authored fadeIn/fadeOut values are applied by GainNode, restoring long fades such as 10 seconds on volume-locked iPhone media elements.
- Scene SE remains on native HTMLAudio so the already-working one-shot path is not disturbed.

## Ending SE
- Normalizes bare asset IDs inside Core.
- Ending SE is removed from the general Scene one-shot bank.
- A dedicated ending Audio element is primed FIRST during START/AUTO and kept silently alive.
- finish() seeks/unmutes that same authorized element instead of requesting a new late playback.
- Manual and AUTO use the same dedicated ending route.

## Preserved
- V2.16 seek-before-open pop/noise fix.
- V2.15 stable iOS live-media bank.
- Cover exit audio fade.
- Scene effects, resonance, viewport fixes, second-read lifecycle fixes.

Changed files:
- scene-player-core.js
- studio/scene-player-core.js
- player-test/scene-player-core.js
