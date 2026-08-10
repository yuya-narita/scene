# Scene Public Player v0.3

Public Player for Scene Format v1.

## Design goal

Scene is not a publishing platform.

The expected flow is:

external article / novel site
→ open Scene Player
→ read with Scene presentation
→ return to the original page

## Start

Default test work:

`/scene/`

Any Scene JSON:

`/scene/?src=https://example.com/work.scene.json`

Optional return destination:

`/scene/?src=...&return=https://example.com/article&returnLabel=記事へ戻る`

## Ending metadata

The Player no longer invents `END`, `つづく`, previous/next/index.

Authors may optionally provide:

```json
"ending": {
  "label": "読了",
  "return": {
    "label": "noteの記事へ戻る",
    "url": "https://note.com/..."
  },
  "links": [
    { "label": "作品一覧", "url": "https://example.com/works" },
    { "label": "次の話", "url": "https://example.com/episode-2" }
  ]
}
```

All fields are optional.

If no explicit return URL exists but the reader arrived from another page,
the Player can use browser Back.

## v0.3 changes

- removed forced `END / つづく`
- removed forced `前 / 一覧 / 次`
- arbitrary author links on the ending screen
- return-to-source behavior
- left header control means leave Scene / return
- right header control is audio mute/unmute
- BGM/Ambient may continue underneath the ending screen
- fixes first Scene vertical placement by making the Player measurable before `Core.load()`


## v0.3.1

- Return button no longer depends on `document.referrer`.
- If an explicit return URL exists, it is used first.
- Otherwise, if browser history contains a previous page, the Player shows
  `元のページへ戻る` and uses `history.back()`.
- This fixes publisher sites that suppress referrer information while normal
  browser Back still works.
