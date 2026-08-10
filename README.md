# Scene — Public Player v0.1

Scene Studio v0.2 / Scene Player Core v1.12.14 を使った公開専用Playerです。
Studioの編集UIは含みません。

## GitHub Pagesで公開

このフォルダの**中身**を `yuya-narita/scene` リポジトリのルートへアップロードします。
その後 GitHub の `Settings > Pages` で `Deploy from a branch / main / root` を選びます。

公開URL:

```text
https://yuya-narita.github.io/scene/
```

何も指定しない場合は同梱の `EXTERNAL SIGNAL` が再生されます。

## 別作品を再生

作品JSONをリポジトリ内へ置き、`?src=` で指定します。

例:

```text
https://yuya-narita.github.io/scene/?src=./works/external-signal/scene.json
```

将来 `works/hx-infinity/scene.json` を追加した場合:

```text
https://yuya-narita.github.io/scene/?src=./works/hx-infinity/scene.json
```

外部サイト上の Scene Format v1 JSONも、相手側がCORSを許可していれば指定できます。

## 構成

```text
index.html
public-player.js
public-player.css
scene-player-core.js
scene-player-core.css
works/
  external-signal/
    scene.json
```

## 原則

Public Player自体に作品の画像・音声を抱え込む必要はありません。
Scene JSON内の `src` からGitHub Pages等の外部画像・音声を参照できます。
