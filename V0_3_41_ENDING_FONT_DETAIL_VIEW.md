# v0.3.41 — Ending font parity + detailed display mode

- Easy ending preview now honors authored `ending.fontFamily` even against the legacy preview `!important` typography rule.
- Studio `ScenePlayerCore` now applies `ending.fontFamily` directly to the ending title, matching Public Player behavior.
- Effect detail inspector now exposes `presentation.view` (`world / console / system / warning / void`).
- Cancel/restore/reset flows include display mode.
