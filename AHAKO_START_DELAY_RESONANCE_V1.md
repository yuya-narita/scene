# あ箱 — 開始遅延拡張 + 共鳴率 v1

## 開始遅延
- 演出詳細の「開始遅延」を 0〜600秒（10分）へ拡張。
- 0.1秒刻み。長いイントロでも直接秒数を入力可能。
- iPhoneでは長大レンジを巨大なドラム選択にせず数値入力へ切替。
- 既存 `presentation.effectTiming.delay` を使うためFormat互換。

## 共鳴率
- Studio「時間」パネルに「読者との共鳴率」ON/OFFを追加。デフォルトOFF。
- `player.resonance.enabled` に保存。AUTO RECとは独立。
- ONかつ全SceneにAUTO RECの `pause` がある作品だけ計測。
- 読者の手動タップで各Sceneの滞在時間を取り、作者AUTO RECとの差を比較。
- AUTOをON、Historyを開く、途中CONTINUEの場合は結果を表示しない。
- 途中判定は出さず、読了ページに最終の共鳴率だけ表示。
- 共鳴率は心理的相性ではなく、その作品での「間」の近さ。
