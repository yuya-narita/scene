# v0.2.42 — Split UI Removed

- Removed the Easy Studio Short / Normal / Long split-density UI.
- Existing SceneTextSplitter remains untouched.
- Easy Studio now always uses the tested `normal` density internally.
- Old local drafts that stored short/long density are opened as normal.
- Pending resplit state from older experimental builds is ignored.
- Advanced manual `merge` / `split at cursor` remains the author-facing adjustment path.
