# v0.2.46 — Publish button restart fix

「最初から読む」で Scene Player Core は `sceneplayer:restart` を発火します。
v0.2.45 は `sceneplayer:scenechange` と `sceneplayer:end` だけを監視していたため、
END画面で表示した公開ボタンが2周目の最初だけ残っていました。

v0.2.46:
- `sceneplayer:restart` を監視
- restart直後に公開ボタンを非表示
- 公開状態（未公開 / 公開中 / 変更あり）は保持
