# Public Player v0.3.36 — Studio UP parity

Compared against the current Studio preview implementation in
`studio_live_timing_v1_10_FORMAT_V1_SYNC.zip`.

- `up`: now uses Studio's exact Scene-level exit rule:
  `transform: translateY(-4px)`, `filter: blur(2px)`, same `--sp-disappear-fade`.
- `stay`: keeps the v0.3.34 fix and does not change Scene position.
- No timing values were changed.
