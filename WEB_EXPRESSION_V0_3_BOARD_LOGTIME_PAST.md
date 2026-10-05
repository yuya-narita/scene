# Web Expression v0.3 — Board / Log Time / PAST

Experimental branch based on Web Expression v0.2.

- Board stack geometry measures the whole board post, preventing long responses from overlapping the next Scene.
- Shared `presentation.logTime` modes: `none`, `work`, `edit`, `reader`.
- Board and Chat use the shared time display.
- Board editor has `このScene以降を通常に戻す` in desktop/mobile editing surfaces.
- PAST renders board Scenes with board metadata/body styling instead of generic Scene text.
- Existing v0.2 `webBoard.date` is retained as a compatibility fallback and migrated visually as work time.
- Commerce, CAGE, RELAY and crowdfunding implementation are untouched.
