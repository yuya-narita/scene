あ箱 — 共鳴率 v1.3 SAFE MERGE

土台:
ユーザー提供の「チャット吹き出しが正常だった最新版Player本体」から再構築。
古いv1/v1.2のPlayer/CSSを丸ごと上書きせず、共鳴率と開始遅延の変更だけを移植しました。

今回の修正:
1. チャット吹き出し回帰
   - scene-player-core.js / scene-player-core.css は一切変更していません。
   - 正常だった最新版PlayerのCoreをそのまま維持します。

2. 読了ページ「もう一度読む」が画面外へ押し出される
   - 共鳴ON時だけ読了レイアウトを圧縮。
   - 必要時は読了ページ内部だけスクロール可能。
   - 共鳴OFF時は従来レイアウトのまま。

3. 共鳴率
   - 作者のAUTO REC Scene時間と読者の手動タップ間隔を比較。
   - AUTO/History/途中開始では無効化。
   - 判定幅は v1.2 の緩め設定を維持。
   - 100%は完全一致のみ。

4. Studio 時間パネル
   - 共鳴ON/OFFをScene一覧直下に表示。
   - 時間パネルだけ78dvhまで拡張し、中身をスクロール可能。

5. 開始遅延
   - 0〜600秒、0.1秒刻み。
   - 長いレンジではiPhoneの巨大selectを避け直接数値入力。

更新ファイル:
- public-player.js / public-player.css
- player-test/public-player.js / player-test/public-player.css
- studio/script.js / studio/style.css
- scene-format-v1.schema.json
- studio/scene-format-v1.schema.json

重要:
チャットCoreは更新対象に含めていません。
