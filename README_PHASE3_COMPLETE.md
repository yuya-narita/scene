# あ箱 Distribution Observation — Phase 3 完成版 (V52)

Phase 3「Distribution.scene の匿名観測」を完成状態にした更新セットです。

## 完成した動作

- Distribution.scene だけを匿名観測対象にします。
- Local Player で作品を開始すると `start`、進行時に `progress`、読了時に `complete` を送信します。
- workId / copyId / copyId専用observerId / sessionId / Scene数 / Scene位置だけを観測用APIへ送信します。
- 氏名、購入者情報、注文情報、ファイル名、保存場所、本文、作品タイトル、作者名は観測payloadに含めません。
- observerId は copyId ごとにブラウザ内で生成し、異なるcopyId間の共通利用者IDにはしません。
- Master.scene はこのDistribution観測の対象外です。
- V51の同意confirmダイアログは削除しました。Distribution.sceneでは匿名観測を標準動作とします。
- 旧 `ahako:distribution-observation-consent:v1` はV52読み込み時に削除され、以後の制御には使いません。
- Cloudflare Worker の `/distribution-observation` と `/admin/distribution-observation` を利用します。
- 管理画面では「今日/7日間の観測読者+」「読了」「起動」「観測された一冊」「作品別」を表示します。

## ファイル

- `local-player/` — V52 Local Player。GitHub Pages等のLocal Player配置先へ更新。
- `cloudflare/worker.js` — 現行Workerを正本にDistribution Observationだけを統合した更新用Worker。
- `admin/` — Distribution Observation表示を追加した管理画面。
- `privacy/index.html` — Reader既存方針を維持しつつ、Distribution.scene匿名観測を明記したプライバシーポリシー。

## 観測読者+ の意味

`観測読者+` は、選択期間内に観測された `(copyId, observerId)` の組み合わせ数です。実在する人物の厳密なユニーク人数ではありません。同一人物の複数端末・ブラウザ等を別観測として含む場合があり、通信不能時の閲覧は含みません。

## Phase 3の範囲外

RELAY（relayId / parentRelayId）、購入者情報との照合、DRM、署名、海賊版判定は実装していません。これらは次フェーズ以降です。
