# Public Player v0.3.38 — Background / screen-lock audio fix

iPhone / iOS behavior:

- Home / app switch / screen lock immediately pauses BGM and Ambient.
- SE / one-shot sounds are stopped and are not replayed.
- AUTO is turned off so Scenes do not advance while hidden.
- Web Audio is suspended when available.
- Returning to the Player does NOT automatically restart sound.
- The next deliberate Player gesture resumes active BGM/Ambient from the paused position.

Lifecycle events:
- visibilitychange
- pagehide
- freeze
- blur fallback

Scene Format v1 is unchanged.
