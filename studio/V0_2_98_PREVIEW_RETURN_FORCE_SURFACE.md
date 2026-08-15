# v0.2.98 — Preview return force surface

- Preview -> 編集に戻る now restores the authoring UI before any player/audio cleanup.
- Player cleanup errors can no longer trap the user in Preview.
- Return gesture moved from pointerdown to pointerup/click to avoid exposing Studio under a still-active touch.
- Added document-capture fallback for iOS/WebKit.
- Preserves Easy/Advanced return target and saved scroll position.
