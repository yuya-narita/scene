# v0.3.40 — Authored Cover / Ending Fonts

- Display View remains a stage preset; explicit Scene text font/color/shadow now wins over the preset.
- Cover Quick Edit adds a cover font selector: serif / sans / mono.
- Ending Quick Edit adds a center-text font selector: serif / sans / mono.
- `cover.fontFamily` and `ending.fontFamily` round-trip through `.scene`.
- Public Player and Studio previews apply the authored choices.
- Existing files without these fields keep the prior Mincho/serif look.
