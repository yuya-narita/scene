# AHAKO Expressive Text Effects V2.12

Audio fix based on iPhone V2.11 diagnostics.

- Ending SE: hydrate bare published asset IDs to `/asset/<id>` before Player load. iPhone log showed `NotSupportedError` for the raw ending asset ID.
- iPhone later-Scene audio: do not pre-connect idle BGM/Ambient elements to `MediaElementSource` before their real source starts.
- One-shot SE elements are now source-stable. An element already routed through Web Audio is never reused with a different SE source; this addresses iOS `play()` resolving while the changed source remains silent.
- AUTO primes the actual future BGM/Ambient/SE source on the same stable element while muted, waits for every prime to settle, then starts AUTO timers. Real playback unmutes synchronously before `play()`.
- Fix persistent transport classification for Scene Studio CORS assets.
- V2.10 two-pass SE fix and V2.7 cover fade are retained.
