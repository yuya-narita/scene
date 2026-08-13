# v0.2.36 — Empty Scene semantics

Easy-side removal of all text now uses an explicit judgment:

- Scene has background, audio, AUTO timing, subtext, non-default presentation, non-text type, or unknown/custom Format data:
  keep the Scene and clear only text; list label becomes `（演出のみ）`.
- Pure text Scene with no remaining Advanced meaning:
  delete the Scene.
- If deletion happens during Easy → Advanced reconciliation:
  show the normal 3.5-second deletion Undo notification and retain persistent compact Undo.
- The final sole Scene is retained as an empty technical placeholder so Advanced never receives a zero-Scene document.
