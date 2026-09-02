# AHAKO V2.22 — iPhone cover viewport fix

Base: V2.21 CLEAN.

- Removed the `100svh` max-height cap from fixed Public Player / cover / ending layers.
  Safari expands the visible viewport when its toolbar hides; `100svh` remains the small viewport and exposed the layer underneath the cover.
- The report trigger is explicitly hidden while the cover is visible and restored when reading starts.
- No Scene Core, audio, ending-SE asset, resonance, effects, or Studio behavior changed.
