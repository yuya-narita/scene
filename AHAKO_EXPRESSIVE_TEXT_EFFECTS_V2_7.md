# AHAKO EXPRESSIVE TEXT EFFECTS V2.7

Audio resilience patch.

- iPhone ending SE: stage click re-arms audio after pointerdown, so a one-shot that Safari temporarily blocks can be retried by the same physical tap.
- AUTO audio: AUTO start explicitly re-arms audio and reconstructs current BGM/Ambient. A single blocked AUTO sound no longer disarms all later BGM/Ambient/SE commands.
- Graceful exit audio: ScenePlayerCore now exposes `fadeOutAudio()`. Public Player uses an 850ms fade before Cover/restart/player replacement instead of a hard audio cut.
- Keeps V2.6 layout, two-read fix, Scene1 SE, ending SE authoring, GLITCH HIT left/right, SLAM/BURST/RUSH, overlay, font weight, SHATTER/EXPLODE.
