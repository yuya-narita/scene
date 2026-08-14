# AUTO REC v1 rebuilt

Base: v0.2.17 Background Preview v2.

- REC button is explicit HTML inside playerScreen.
- Recorder state/functions live inside the Studio IIFE.
- Scene changes record dwell milliseconds.
- Final advance writes each duration to scene.pause.
- Normal AUTO already consumes scene.pause.
- Leaving preview cancels an unfinished take.
