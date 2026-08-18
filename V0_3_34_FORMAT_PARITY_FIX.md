# Public Player v0.3.34 — Format v1 parity fixes

## Fixed
1. Cover episode title typography
   - Public cover now uses the same serif stack as Studio/Core.
   - Lining numerals are explicitly requested so `v1` does not render the digit at a mismatched visual size.

2. `disappear.motion: stay`
   - Scene article layout transform is no longer cleared during disappearance.
   - `stay` now fades at the exact landing position.
   - `up` moves the text/subtext only, preserving the Scene article's layout coordinate.

This fixes the observed Format sync test differences without changing Scene Format v1.
