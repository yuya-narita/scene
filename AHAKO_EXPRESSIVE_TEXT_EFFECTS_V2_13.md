# AHAKO EXPRESSIVE TEXT EFFECTS V2.13

Audio architecture fix for iPhone/iPad Safari.

- Keeps V2.12 public-player asset URL resolution and viewport/fade fixes.
- Replaces later iOS Scene audio playback with a decoded AudioBuffer bank.
- All work audio (BGM / Ambient / Scene SE / Ending SE) begins fetch+decode when the work loads.
- START/AUTO resumes one AudioContext; later Scene/AUTO timers only start already-decoded buffers.
- Scene 1 can still fall back to the existing media path if decoding is not ready yet.
- AUTO waits for the document buffer preload on iOS before scheduling Scene advancement.
- Persistent BGM/Ambient support start, loop, volume, fade-in/out, duck, stopAfter/stopAt through GainNode.
- One-shot Scene SE and Ending SE use the same decoded-bank route on iOS.
- Existing non-iOS media path remains unchanged.
- Existing cover-return fade also fades/stops buffered audio.

Changed:
- scene-player-core.js
- studio/scene-player-core.js
- player-test/scene-player-core.js

Unchanged from V2.12:
- public-player.js / public-player.css
- Studio UI / Splitter / Admin / Privacy / schema
