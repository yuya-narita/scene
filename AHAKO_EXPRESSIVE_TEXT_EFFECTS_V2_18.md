# AHAKO Expressive Text Effects V2.18

## iPhone Ending SE fix

V2.17 restored long BGM/Ambient fades, but Ending SE was still silent on iPhone.

The remaining difference was transport architecture: Scene SE used the proven source-stable iOS live-media one-shot bank, while Ending SE still used a separate dedicated HTMLAudioElement.

V2.18 removes that difference for actual playback:

- Ending SE is collected into the same iOS one-shot bank during `load()`.
- Its real asset URL is resolved before the bank is built.
- START/AUTO primes it together with Scene SE.
- `finish()` now calls the same `_playIOSBankOneShot()` path used by working Scene SE.
- The old dedicated ending element is no longer the primary playback path.
- BGM/Ambient fade-in behavior from V2.17 is unchanged.

Changed files:
- `scene-player-core.js`
- `studio/scene-player-core.js`
- `player-test/scene-player-core.js`
