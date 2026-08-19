# v0.3.46 — Live Preview Sync

## Goal
Authoring changes should be visible in the current Studio preview immediately, without advancing to another Scene or reopening Preview.

## Player Core
Added public `refreshCurrent(options)` to both Public Player Core and Studio Player Core.

- redraws the current Scene through the real Player renderer
- replays entrance / typing / display / view / entryMotion presentation
- reapplies text and background presentation immediately
- keeps persistent BGM / Ambient transport untouched during authoring refresh by default
- emits `sceneplayer:refresh`

## Studio
Live Edit now uses `player.refreshCurrent()` instead of directly manipulating private Player fields.
Effect replay no longer manually double-triggers entrance animation; a fresh Player render is the single source of truth.

Immediate preview applies to authoring changes including:
- effect / typing
- entry motion (`flow` / `still`)
- display (`stack` / `solo`)
- display view (`world` / `console` / `system` / `warning` / `void`)
- font / size / color / shadow
- text and background presentation changes that already call the live refresh path

Persistent audio is intentionally not restarted just because a visual authoring setting changed.
