# v0.2.50 — iOS package export fix

Selected local files are copied immediately into Studio-owned Blobs so iOS Files provider handles cannot expire before `.scene` export. Export also falls back to the active blob URL for older drafts.

Applies to Advanced background/BGM/Ambient/SE, Easy CINEMA background, and cover image.
REC, Splitter, publish state, Player Core, and Scene Format are unchanged.
