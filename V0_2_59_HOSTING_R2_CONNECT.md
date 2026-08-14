# v0.2.59 — Hosting / R2 connection

- Based on v0.2.58 i18n stragglers fixed.
- Replaced the publish mock adapter with the real Cloudflare Worker endpoint.
- Publish now POSTs the complete Scene document to `/publish`.
- Stores the returned publication ID and real `/work/:id` hosted-data URL in the existing draft/publication state.
- Existing Easy / Advanced / Player / REC / local draft / .scene import-export behavior is otherwise unchanged.
- The current hosted URL is intentionally the JSON document endpoint. Reader-facing Player routing is the next hosting step.
- Update-in-place and unpublish remain local UI/state behavior until corresponding Worker endpoints are added.
