# v0.2.41 — Protected Resplit, Splitter Untouched

Built directly from v0.2.38. v0.2.39/v0.2.40 are not used.

The Japanese/English/multilingual Splitter implementation is unchanged.

Only an outer protection layer was added:
1. Protected Advanced Scenes are copied unchanged.
2. Consecutive plain, unedited text Scenes are collected.
3. Their text is passed to the existing `splitBody()` / `SceneTextSplitter.splitDetailed()`.
4. The resulting plain Scenes are put back between the protected anchors.

Protected:
- image/background
- audio
- recorded AUTO pause
- subText
- non-text type
- non-default display/effect/text styling
- unknown/custom Format fields
- textless Advanced-only Scene

The run separator uses actual JS newline escapes (`\n\n`), not literal backslash-n text.
