# AHAKO_EXPRESSIVE_TEXT_EFFECTS_V2.15

## iPhone audio transport rebuild

V2.14 device trace showed:
- Scene 2 BGM / SE commands reached BufferSource start successfully, but iPhone hardware output remained silent.
- Ending SE fell back to HTML Audio and was blocked when it had not been authorized earlier.

V2.15 removes the iOS AudioBuffer playback path and replaces it with an **iOS live media bank**.

### New iOS behavior
- On document load, create one source-stable HTMLAudioElement per real BGM / Ambient / SE source.
- On the trusted START gesture, call `play()` on every real source while muted and keep each element continuously alive.
- Scene transitions do **not** create a new Audio element, swap its src, or require a new Safari playback permission.
- Scene 2 BGM / Ambient: seek + unmute the already-playing bank element.
- Scene SE / Ending SE: seek + unmute the already-playing one-shot bank element, then mute it again instead of pausing it.
- AUTO uses the exact same bank as manual playback.
- Returning to Cover silences/reset the bank without destroying its authorization; existing fade-out behavior is retained.

### Changed files
- `scene-player-core.js`
- `studio/scene-player-core.js`
- `player-test/scene-player-core.js`

Public Player, Studio UI, Scene Format, Splitter, Admin, chat, Scene image and resonance layout are otherwise unchanged.
