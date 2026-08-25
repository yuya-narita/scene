player-test v0.12 — Scene image active-tap fix

Tapping the current Scene's foreground image is now handled by the same stage
controller that normally advances Scenes. Image taps open fullscreen and return
before next() is called.

Cloudflare ?src= loading is preserved.
Past-Scene image fullscreen remains unchanged.
