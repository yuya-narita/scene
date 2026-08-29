あ箱 共鳴率 v1.9 — 過去作品に0.0%が出る本当の原因を修正

原因:
共鳴率を表示する関数で、score が null の時に先に Number(score) を実行していました。
JavaScriptでは Number(null) === 0 なので、

  共鳴OFF / 過去作品 / 測定結果なし
  ↓
  null
  ↓ Number(null)
  0
  ↓
  RESONANCE 0.0% を表示

となっていました。

つまり、過去作品のON/OFF判定そのものだけが原因ではなく、
「結果なし(null)を0点として描画していた」のが直接原因です。

修正:
- null / undefined / 空文字は数値変換する前に「結果なし」と判定
- 結果なしなら共鳴率ブロックを完全に非表示
- has-resonanceクラスも外す
- 本当に測定できた数値だけ表示

v1.8の厳格な作者Opt-in条件はそのまま維持します。

更新:
- public-player.js
- player-test/public-player.js
