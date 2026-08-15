# v0.3.12 — Publish / re-edit stability

- After a successful publish, Studio now adopts the permanent hosted/R2 asset URLs returned in the exact published document instead of continuing to depend on session-only `blob:` URLs.
- This prevents a cover image from disappearing when a published work is reopened for editing, especially after an iPhone/Safari page lifecycle change.
- Publish/update requests now have a timeout instead of leaving the “Publishing…” state spinning forever.
- Existing-work updates retry once after a timeout using the same work id. New publications are never retried automatically, avoiding duplicate work IDs.
- A failed/timed-out update now moves to the existing error state instead of remaining in Working forever.
