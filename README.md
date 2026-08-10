# Scene Public Player v0.2

Public shell for Scene Player Core.

## v0.2
- opening screen: start / continue
- left header button returns to work entrance
- right header button is music mute/unmute
- custom ending shell with Previous / Index / Next / reread
- BGM is not automatically stopped when the reading ends
- bundled EXTERNAL SIGNAL test no longer sends an explicit BGM stop on its last Scene
- progress is stored locally for Continue

## URL
Default work:
`/scene/`

Other Scene Format:
`/scene/?src=https://example.com/work.scene.json`

Optional navigation query params:
`prev=...&index=...&next=...`
