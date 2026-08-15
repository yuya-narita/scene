# v0.2.99 — Preview return isolated

- `編集に戻る` is moved outside `#playerScreen` so ScenePlayerCore/iOS gestures cannot swallow it.
- Restored the v0.2.94 known-good click interaction path.
- Returning swaps the Studio surface first; Player/audio cleanup is deferred and isolated.
- Original Easy/Advanced return target and scroll-position restoration remain.
