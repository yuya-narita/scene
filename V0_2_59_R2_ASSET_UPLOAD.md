# v0.2.59 a-hako — R2 asset upload connection

- Publish now scans Scene background/BGM/Ambient/SE references.
- Browser-local `blob:` assets are POSTed to `https://scene-studio-api.a-hako.workers.dev/asset` before the Scene document is published.
- Returned permanent `/asset/...` URLs replace local `blob:` URLs only in the hosted copy.
- The editable local draft remains unchanged and keeps its local asset registry.
- Duplicate references to the same local asset are uploaded only once per publish operation.
- External http(s) asset URLs are left unchanged.
