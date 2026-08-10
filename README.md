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


## v0.3.9

Rapid-input hardening, rebuilt from stable v0.3.6.

Important: this version intentionally drops the v0.3.7 render-generation
experiment and the v0.3.8 mixed-input mutex.

- Only one Scene navigation is accepted during a ~720 ms landing window.
- Extra taps/clicks during that window are discarded rather than queued.
- Browser keyboard auto-repeat (`KeyboardEvent.repeat`) is ignored.
- Wheel/swipe History opening is ignored while a Scene landing is active.
- History selection uses only a short settle lock.
- Typography/PAST fixes from v0.3.6 are retained.

Design rule: the Player prioritizes deterministic landing over processing every
rapid input event.
