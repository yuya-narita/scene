あ箱 共鳴率 v1.8 — 過去作品を確実にOFFへ

v1.7の authorOptIn:true だけでは、開発途中の版で既にその値が
保存された過去作品までON判定になる可能性がありました。

v1.8では明示ONをバージョン化します。

有効条件:
- enabled === true
- authorOptIn === true
- authorOptInVersion === 2

authorOptInVersion:2 は、v1.8以降のStudioで作者が共鳴率スイッチを
実際に操作した時だけ保存されます。

そのため:
- 過去作品 → OFF
- 開発途中で共鳴設定が混入した作品 → OFF
- 新規作品 → OFF
- 使いたい作品だけ、v1.8適用後に時間パネルでON

現在テスト中の共鳴作品も一度OFF扱いになります。
使いたい作品だけONにし直してください。

更新:
- public-player.js
- player-test/public-player.js
- studio/script.js
- scene-format-v1.schema.json
- studio/scene-format-v1.schema.json
