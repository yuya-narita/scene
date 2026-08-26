# v0.3.00 — Preview true overlay

- Preview no longer replaces the Easy/Advanced authoring screen.
- The authoring surface stays mounted underneath the Player.
- 「編集に戻る」 only closes the Player overlay, avoiding iOS/WebKit screen-swap failures.
- The original authoring mode and scroll position are preserved.
- Player/audio cleanup runs only after the overlay has already been removed.
