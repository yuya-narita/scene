# v0.3.02 — Preview hard return

- Fixed malformed v0.3.01 CSS that contained literal `\\n` escapes and therefore never applied.
- Preview now hides Studio floating controls directly in JavaScript as well as CSS.
- Added `#playerScreen:not([hidden])` fallback selectors so Preview chrome isolation does not depend on a body class.
- `編集に戻る` is captured at the window level on pointer/touch start, before Player gesture handlers can consume the event.
- Added inline gesture-start fallback to the return button.
- Closing Preview hard-hides the Player with inline `display:none!important`, restores Studio chrome, then restores the saved scroll position.
