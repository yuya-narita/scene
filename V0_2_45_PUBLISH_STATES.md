# v0.2.45 — Publish states

Publication UI now has three author-facing states:

1. Unpublished
   - End button: 公開する
   - Confirmation: この作品を公開しますか？
   - New mock URL is issued.

2. Published / unchanged
   - End button: 公開中
   - Opens the existing published URL/share panel directly.
   - Does not issue a second URL.

3. Published / changed
   - End button: 変更を公開
   - Confirmation: 公開中の作品を更新しますか？
   - Reuses the same publish ID / URL.

Publication metadata is stored with the local draft.
A stable fingerprint normalizes blob asset URLs so local asset restoration does not
immediately mark a published work as changed.

Also removes the iOS blue focus square around the Publish dialog close button.
