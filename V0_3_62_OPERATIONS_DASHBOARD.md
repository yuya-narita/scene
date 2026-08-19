# v0.3.62 Operations Dashboard

- Admin top summary: work count, published, suspended, R2 usage, asset count, open reports.
- Shows top 10 works by approximate size.
- Approximate work size = scene JSON + assets referenced by that work. Shared assets are counted in each referencing work.
- Worker adds authenticated GET /admin/stats.
- R2 total usage is calculated from current object sizes in the bucket.
