player-test v0.11.1 — active Scene image tap fix

Fix:
- Tapping a Scene image in the current/active Scene now opens fullscreen.
- The image tap is intercepted before the Player-wide tap-to-next-Scene handler.
- Tapping the image no longer advances to the next Scene.
- Past-Scene drum image fullscreen behavior remains unchanged.

This package preserves the existing Cloudflare ?src= loading route.
Replace the existing GitHub /player-test/ folder with this one.
