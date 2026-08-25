# あ箱 player-test (Chat Scene test)

公開中のβ Player を触らずに、同じ Cloudflare の公開作品をチャット対応 Player で確認するためのテスト用フォルダです。

## GitHub への置き方
リポジトリの公開ルートに、この `player-test` フォルダをそのまま追加してください。

例:
- 本番: `/scene/`
- テスト: `/scene/player-test/`

## 開き方
Studio から今まで通り作品を公開し、Cloudflare の作品URLを `src` に渡します。

例:
`https://yuya-narita.github.io/scene/player-test/?src=https%3A%2F%2Fscene-studio-api.a-hako.workers.dev%2Fwork%2FWORK_ID`

`WORK_ID` は実際に公開した作品のIDへ置き換えてください。

## このテスト版の差分
- 公開β版 Player の読み込み処理・Cloudflare `?src=` 方式は維持
- Chat Scene の吹き出し / アイコン / 左右配置 / モバイル表示を追加
- Studio 側のファイルは含みません

公開中のβ Player フォルダには上書きせず、実機確認が終わるまでは別フォルダで使用してください。
