# v0.3.64 AHACO ADMIN Analytics

- Public Player records anonymous per-open reading sessions to the Worker.
- Metrics: views, completions, Scene advances.
- One R2 JSON object per page-open session; Scene progress overwrites that same object.
- No login/user identifier, email, IP, or device fingerprint is stored by this feature.
- Admin shows today's metrics (JST) and 7-day popular works TOP10.
- Cloudflare Worker and GitHub Player/Admin must both be updated.
