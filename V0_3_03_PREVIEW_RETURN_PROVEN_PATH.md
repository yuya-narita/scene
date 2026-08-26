# v0.3.03 — Preview Return Proven Path

- Restored the Preview return architecture that was proven working in v0.2.89.
- `編集に戻る` lives inside `#playerScreen` again.
- Removed window-level pointer/touch interception and inline hard-return handlers.
- Preview uses normal `setScreen("player")` / `setScreen(target)` switching again.
- Keeps exact Easy/Advanced scroll-position restoration.
- Keeps Preview chrome isolation for ⚙︎ / ▶ / ↶.
