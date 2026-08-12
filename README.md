# Scene Public Player v0.3.14 — R2 routed public build

This build keeps the generic `?src=` loader and is intended to be the public
reader target for Scene Studio Hosting.

Production route:

`https://scene-studio-api.a-hako.workers.dev/work/<id>`
→ Worker detects normal browser navigation
→ redirects to
`https://yuya-narita.github.io/scene/?src=<encoded work URL>`
→ this Player fetches the R2 Scene JSON
→ R2-hosted image/audio assets play normally.

Direct Player test:
`https://yuya-narita.github.io/scene/?src=https%3A%2F%2Fscene-studio-api.a-hako.workers.dev%2Fwork%2F6330508d9dca`

No new Scene presentation/effects are added in this build. It is only the
public Hosting hand-off layer.

---

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


## v0.3.2

Public Player hand-off cleanup.

- Removed the built-in `元のページへ戻る` ending button.
  Returning is left to browser / OS navigation.
- Ending defaults to optional author links plus `もう一度読む`.
- `Sceneについて` remains an optional Scene/Studio discovery link.
- Added an opening breath:
  `はじめる` → intro fade → first background only for about 450 ms →
  Scene 1 begins with its original author-selected entrance effect.
- Scene 1's effect is not replaced or softened by the Public Player.

## v0.3.3

Audio exit polish.

- Public Player navigation/restart now asks BGM and Ambient to fade for about
  1.6 seconds instead of cutting them immediately.
- Active one-shot audio is also faded on Player-controlled exits.
- `pagehide` performs a best-effort fade when leaving/closing the page.
  Browsers may terminate a closed tab immediately, so a full 1.6-second fade
  cannot be guaranteed for a hard tab/app close.


## v0.3.4

History tap fix.

- A swipe that opens History sets an anti-ghost-click flag.
- Selecting a past Scene now clears that flag immediately.
- Closing History with × also clears it.
- Result: past Scene → return → the very next stage tap advances normally.
  No extra "dead" tap is consumed after returning from History.


## v0.3.5

Left header control fix.

- `‹` now opens the PAST / visited Scene history.
- Tapping it again while History is open closes History.
- It no longer attempts to close Scene or navigate back to the source site.
- Source-site navigation remains the browser / OS responsibility.


## v0.3.6

PAST typography consistency.

- History/Past Scene text now inherits the same typography source as Player text.
- Scene-level `presentation.text.fontFamily` takes priority.
- Otherwise the work-level `appearance.typography.fontFamily` is used.
- History also carries scene text weight/style/letter-spacing when specified.
- Result: PAST looks like the same work, not a separate reader layer.


## v0.3.13

Black-screen root fix.

Root cause:
- graceful audio exit keeps the old Player alive for ~1.6 s.
- after the fade, the old Player called `destroy()`.
- old and new Player instances share the same `#scenePlayer` host.
- old `destroy()` cleared `host.innerHTML`, erasing the NEW Player DOM.
- the new Player object/audio kept running, producing `nodes=0` + audio-only black screen.

Fix:
- `ScenePlayerCore.destroy({ preserveHost: true })` cleans audio, timers, context,
  and event listeners without touching the shared host DOM.
- delayed post-fade cleanup now always uses `preserveHost: true`.
- immediate/full destroy behavior remains available for genuine teardown.
