# Scene Format v1 — Current Studio Contract

## 方針
- `format: scene-format`
- `version: 1.0` は維持する。
- 既存 `.scene` との互換性を壊さない。
- 今回は新機能追加ではなく、現在のStudioが既に扱っている値をFormat v1の正式仕様へ追記する。

## 改行
作者が入力した改行はコンテンツとして扱う。

- `title`
- `ending.label`
- `scene.text`
- `scene.subText`

作者改行がある場所はPlayerが保持する。改行指定のない部分だけ端末幅に応じた自動折り返しを許可する。

**作者改行 > 自動折り返し**

## 作品情報
正式化:
- `metadata.subtitle`
- `metadata.seriesTitle`
- `metadata.episode`
- `metadata.episodeTitle`
- `metadata.description`
- `cover.src / fit / position / logo`
- `ending.label / coverButton / links`

## 文字
`presentation.text` / `presentation.subText`:
- `color`
- `size`
- `fontFamily`
- `shadow`
- `lineHeight`
- `letterSpacing`
- `sideMargin`
- `opacity`
- `align`
- `wrap`

## 演出
`presentation`:
- `display`
- `effect`
- `effectTiming.duration`
- `effectTiming.delay`
- `typing.enabled / speed / cursor`
- `disappear.after / fade / motion`

## 背景
`presentation.background`:
- `src`
- `fit`
- `position`
- `transition`
- `transitionDuration`
- `tone`
- `dim`
- `blur`
- `reveal`
- `motion`
- `textures`

## 音
既存v1モデルを維持:
- `bgm`
- `ambient`
- `oneshot`
- start / stop / volume / duck / play
- volume / loop / fadeIn / fadeOut / fade / hold
- startAt / stopAt / stopAfter / restart

`_editorFileName` はStudio用メタデータ。Playerは無視してよい。

## 次工程
B. Standalone PlayerをこのFormat v1契約へ同期する。
