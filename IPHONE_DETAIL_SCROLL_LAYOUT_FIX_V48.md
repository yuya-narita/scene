# iPhone Detail Scroll / Compact Layout Fix v48

- Base: `AHAKO_V2_22_VERTICAL_WRITING_PROTOTYPE (45).zip`
- Keeps the v47 iPhone Safari detail-modal scroll fix in `studio/script.js`.
- Restores the original v45 `studio/index.html` mobile sheet CSS so compact Live Edit panels keep their established layout.
- When returning from a full detail inspector, removes only the temporary inline sizing/overflow styles that v47 applies to `.live-edit-sheet-body`.
- The same cleanup also runs when the Live Edit sheet is closed, preventing stale detail geometry from leaking into the next compact panel.
- No Scene Format / Player Core / audio behavior changes.
