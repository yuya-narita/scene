# v0.3.63 Orphan Asset Cleanup

- 運営画面に未参照R2素材の検出・削除を追加。
- 現存する全作品のscene/manifestから参照素材を収集し、それ以外の assets/* を孤児素材として扱う。
- 公開処理との競合を避けるため、アップロードから24時間未満の未参照素材は削除対象外。
- 削除直前にも参照状態を再確認し、使用中になった素材は保護。
- /admin/stats に孤児素材件数・容量を追加。
- 管理API: GET /admin/orphans, POST /admin/orphans/cleanup。
