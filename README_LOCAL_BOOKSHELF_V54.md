# あ箱 V54 — Local 本棚 Phase 1

## 目的
作者の Master .scene をサーバーへ預けず、ブラウザの IndexedDB 内で作品単位に管理するローカル本棚。

## 実装
- Master .scene の追加
- Distribution .scene の拒否
- workId 単位で同一作品を更新
- 表紙 / タイトル / 作者 / Scene数 / revision / 更新日時の一覧
- Master .scene の再書き出し
- 本棚から外す（IndexedDB内の本棚コピーのみ削除）
- 本棚全体の ZIP バックアップ / 復元
- 本棚 → Studio の Master 引き渡し
- Studio で編集後「本棚へ保存して戻る」で同じ workId の Master を更新

## 保存境界
- 作品本体: IndexedDB（ローカル）
- サーバー送信: なし
- ブラウザのサイトデータ削除で本棚は消えるため、バックアップ導線を常設

## 配置想定
GitHub Pages の `/scene/bookshelf/` に `bookshelf/` の3ファイルを配置。
Studio は既存 `/scene/studio/` を V54 の `studio/` で更新。
同一originの IndexedDB を使って Master を引き渡す。
