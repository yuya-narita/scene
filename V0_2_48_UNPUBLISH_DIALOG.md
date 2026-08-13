# v0.2.48 — Studio unpublish confirmation

Replaces the browser-native confirm used by 「公開停止」 with a Scene Studio dialog.

Flow:
- 公開停止
- Studio modal
- キャンセル / 公開を停止
- Confirm clears only local publication metadata in this mock
- Local draft / Scene / assets / REC remain

Hosting deletion API is still not connected.
