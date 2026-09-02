# AHAKO V2.20 — iPhone Ending SE Focus Fix

Base: V2.19.

Scope is intentionally limited to iPhone/iPad manual read-completion SE.

- Final Scene physical pointerdown now plays the preloaded dedicated Ending SE directly and audibly in that trusted gesture.
- Ending asset ids are resolved through `_resolveCoreAudioSrc()` before playback.
- The dedicated Ending element is no longer started muted at START; that muted-long-running route was the unreliable path on iPhone.
- AUTO retains the existing START-authorized iOS one-shot bank because AUTO has no physical final tap.
- Scene SE, BGM, Ambient, fade behavior, resonance, presentation effects, Studio data and Public Player shell are otherwise unchanged.
