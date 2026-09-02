# AHAKO EXPRESSIVE TEXT EFFECTS V2.16

Base: V2.15

## iPhone audio fixes

- Keeps the V2.15 source-stable HTMLAudio bank used by iPhone/iPad Safari.
- Scene activation now stays muted while `currentTime` is moved, then opens the audio gate after `seeked` (45 ms fallback). This prevents the seek/unmute transient that produced the "ブツッ" noise at Scene 2, especially during AUTO.
- Fade-in is applied only after the seek has settled instead of unmuting first and then setting the initial volume.
- Bare R2 asset IDs are normalized to the public `/asset/<id>` URL while the iOS media bank is built. This specifically fixes Ending SE being authorized/preloaded with an invalid relative UUID.
- iOS bank lookup treats a bare asset ID and its `/asset/<id>` URL as aliases, so Ending SE reuses the START-authorized media element instead of falling back to a late `play()` call.
- The existing cover-return fade-out remains unchanged.

## Files changed

- `scene-player-core.js`
- `studio/scene-player-core.js`
- `player-test/scene-player-core.js`

No Splitter / Admin / privacy / Scene format changes.
