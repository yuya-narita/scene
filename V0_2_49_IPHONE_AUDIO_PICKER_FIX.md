# v0.2.49 — iPhone Audio Picker Regression Fix

Regression fixed from the earlier v0.2.7.1 hotfix.

Problem:
- Advanced BGM / Ambient / SE file inputs had regained `accept="audio/*"`.
- iOS Files can gray out otherwise valid MP3 files when this restrictive accept filter is present.

Fix:
- Removed `accept="audio/*"` from:
  - `sceneBgmInput`
  - `sceneAmbientInput`
  - `sceneSeInput`

Safety:
- Existing Studio-side validation after file selection is kept unchanged.
- Supported common audio types remain:
  MP3, M4A, AAC, WAV, OGG, OPUS, FLAC
  or files whose MIME type begins with `audio/`.

No changes were made to:
- Scene Player Core audio playback
- REC
- Splitter
- Publish / unpublish
- Local drafts
- Scene Format
