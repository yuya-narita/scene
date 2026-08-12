# v0.2.47 — Published works manager + unpublish mock

Adds a Published section to the existing local draft manager.

For every local draft with a publication URL:
- title
- public status (`公開中` / `変更あり`)
- public URL
- Share
- Copy link
- Unpublish

Unpublish is a mock:
- clears local publication ID / URL / fingerprint
- keeps the local draft and all authoring data
- if the currently opened work is unpublished, its preview state becomes `未公開`

Publishing now stores `publishedAt` and saves the draft immediately so the manager
reflects the new publication without waiting for autosave.

No Hosting / Worker / R2 deletion occurs yet.
