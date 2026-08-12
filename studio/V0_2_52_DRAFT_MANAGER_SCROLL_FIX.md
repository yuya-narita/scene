# v0.2.52 — Draft Manager iPhone scroll fix

Fixes the local-drafts / published-works manager on iPhone.

Changes:
- The modal is now one vertical scroll surface.
- `draft-list` and `published-list` no longer create competing nested scroll areas.
- The underlying Easy Studio page is locked while the modal is open.
- iOS momentum scrolling remains enabled inside the modal.
- The modal header stays reachable while scrolling.
- Removes the iOS blue focus square around the close (×) button.

Unchanged:
- Local draft data
- Published-state data
- REC round-trip
- media packaging
- Player Core
- Splitter
