# v0.3.57 導入

この版は2か所を更新します。

1. GitHub Pages側: scene-main v0.3.57 をアップロード
   - Playerの「運営に報告する」
   - admin.html / admin.js / admin.css
2. Cloudflare Worker側: worker_rights_reports_admin.js の全文へ置換してデプロイ

ADMIN_TOKEN は既存のCloudflare Secretをそのまま使用します。

運営画面:
https://yuya-narita.github.io/scene/admin.html

報告はR2の reports/{reportId}.json に保存されます。
管理画面は ADMIN_TOKEN が正しい場合だけ一覧・停止・再公開・削除・対応済み操作ができます。
