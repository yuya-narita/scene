# v0.3.55 Rights MVP — frontend

- Studio publish dialog now requires explicit rights confirmation before Publish / Publish Changes.
- Public Player exposes a quiet “この作品について報告” entry.
- Report dialog captures reason + workId + current public URL and can copy a ready-to-send report payload.
- Existing hosted publication controls remain unchanged.

## Backend audit
Current frontend already uses:
- POST /work/{id}/unpublish
- POST /work/{id}/republish
- DELETE /work/{id}

Existing v0.2.60 notes say DELETE removes hosted work JSON/state but intentionally preserves hosted assets. Therefore full rights-MVP deletion of R2 assets cannot be safely completed from this repository alone; Worker source/bindings are required.
