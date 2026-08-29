あ箱 共鳴率 v1.7 — 時間パネル + 過去作品互換修正

1) iPhone時間パネルの崩れ
原因:
v1.3で追加されたStudio用Resonance CSSが、実改行ではなく文字列の「\n」のまま
style.cssへ入っていました。そのためiOSのネイティブcheckboxが巨大な青いチェックとして
表示され、時間パネルのレイアウトも崩れていました。

修正:
- CSSを正しい実改行で再実装
- iOSネイティブcheckboxを完全に隠す
- 44×26pxの小さなON/OFFトグルに統一
- 時間パネルは78dvhまで使い、中身だけ縦スクロール
- 他の時間項目を隠さない

2) 設定していない過去作品にも共鳴率が出る問題
方針:
「enabled:true」だけでは有効にしません。
作者が現在のStudio UIで明示的にONへ切り替えた時だけ
player.resonance.authorOptIn=true を保存します。

Playerは
  enabled === true AND authorOptIn === true
の両方がある作品だけ共鳴率を表示します。

これにより:
- 過去作品 → authorOptInが無いので自動的にOFF
- 新規作品 → 標準OFF
- 共鳴率を使いたい作品 → 作者が時間パネルでONにした時だけ有効

注意:
v1.3〜v1.6でONにした現在のテスト作品も authorOptIn をまだ持っていないため、
v1.7適用後は一度、時間パネルで共鳴率をONにしてください。
以後はその設定が保存されます。

更新:
- public-player.js
- player-test/public-player.js
- studio/script.js
- studio/style.css
- scene-format-v1.schema.json
- studio/scene-format-v1.schema.json
