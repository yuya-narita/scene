player-test v0.13 — Scene image pointer fix

Root cause:
The Scene canvas has pointer-events:none by design, so the current Scene image
was not a hit target. Its tap fell through to the Stage and advanced the story.

Fix:
Active zoomable Scene images now opt back into pointer hit-testing. The v0.12
stage handler can therefore detect the image, open fullscreen, and skip next().

Cloudflare ?src= behavior is unchanged.
