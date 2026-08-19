# v0.3.48 — Ending font cascade fix

The Studio Player still had legacy ending CSS with `font-family: ... !important`, so authored `ending.fontFamily` set via normal inline style could not win the cascade.

Fix: Player Core now applies the authored ending font using inline `font-family` with `!important` in both document load and live chrome refresh paths. Public Player receives the same behavior for parity.
