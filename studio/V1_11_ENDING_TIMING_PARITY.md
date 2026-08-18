# Studio v1.11 — Ending timing parity

Studio Preview ending timing now matches Public Player.

- Ending page is mounted immediately on finish.
- Authored ending sentence begins its existing 280ms-delayed / 1200ms fade immediately.
- Ending action boxes retain their existing 3000ms CSS afterglow delay.
- No Scene pause values or Format v1 fields changed.

Result:
`ありがとうございました` appears at the same timing as Public Player,
while the lower ending controls still arrive after the intended afterglow.
