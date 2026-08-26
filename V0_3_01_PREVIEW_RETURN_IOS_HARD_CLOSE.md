# v0.3.01 — Preview return iOS hard-close

- Preview return now closes on pointerup / touchend, with click as fallback.
- Added native inline fallback to the same return path for iOS Safari.
- Player surface is hard-hidden with `display:none !important` before cleanup.
- Studio rail buttons (⚙/✎, ▶, ↶) are forcibly hidden while Preview is open.
- Existing return target and scroll-position restore are preserved.
