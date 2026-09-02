# AHAKO EXPRESSIVE TEXT EFFECTS V2.19

## iPhone ending SE pre-finish fix

- Keeps V2.18 stable Scene SE/BGM/Ambient bank and V2.17 fade behavior.
- Manual reading: on the physical pointerdown of the final Scene, opens the already-primed ending SE bank entry before click/finish bookkeeping.
- AUTO: opens the already-primed ending SE bank entry immediately before finish(), while the AUTO audio session is still active.
- Existing `_endingAudioStarted` guard prevents duplicate playback when finish() subsequently calls `_playEndingAudio()`.
- Buttons, links, zoomable Scene images, and Live Editor text do not pre-trigger ending SE.
- No changes to Splitter/Admin/Privacy/schema/public layout.
