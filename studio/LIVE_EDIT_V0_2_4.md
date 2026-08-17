# Live Edit v0.2.4

- Fix: tapping the current Scene text now reaches the Live Edit handler.
- ScenePlayerCore keeps `.sp-scenes { pointer-events:none }` for normal Player navigation, so Live Edit explicitly enables pointer events only on `.sp-scene.is-active .sp-text`.
- Background taps and past Scene text remain owned by the normal Player behavior.
- Aa inline editing from v0.2.3 is unchanged.
