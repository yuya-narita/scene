# v0.3.47 — Live shell font sync

- Studio Live Editor cover now honors `cover.fontFamily` immediately.
- Studio Live Editor ending page now honors `ending.fontFamily` immediately.
- Added `ScenePlayerCore.refreshDocumentChrome()` so cover/ending metadata can be refreshed without replaying the current Scene or disturbing audio.
- Public Player Core also honors `ending.fontFamily`; the public cover/ending wrapper continues to honor both authored font fields.
