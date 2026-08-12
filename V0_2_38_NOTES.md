# v0.2.38

Fixes delete-vs-edit detection in Easy → Advanced reconciliation.

Problem in v0.2.37:
When Easy removed the first text Scene, the reconciler treated the next paragraph
as an edit of Scene 1. Scene 1's BG/AUTO shell therefore migrated to the next text,
and the unused shell appeared later as an extra `(演出のみ)` Scene.

v0.2.38:
- If the current Easy text matches a later original Scene, the current original
  Scene is classified as deleted.
- Deleted Scenes with Advanced meaning keep an empty shell in the same position.
- Pure text-only deleted Scenes are removed and use the existing Undo notification.
- If original text appears later in Easy, it is classified as an insertion before it.
- Otherwise it is treated as a true edit.
