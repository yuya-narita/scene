# AHAKO Expressive Text Effects V2.21

Base: V2.19

## Ending SE asset fix
- Ending SE is now included in the same `walkAssetRefs()` pipeline as Scene audio.
- `.scene` export embeds Ending SE under `assets/` instead of persisting a temporary `blob:` URL.
- `.scene` import restores Ending SE to a fresh live object URL just like Scene SE.
- Publish uploads Ending SE through the normal asset endpoint and stores the hosted asset URL in the published document.
- Removed the Ending SE external URL field / `URLを反映` UI. Ending SE is file-selection only.
- Audio playback engine is unchanged from V2.19.

## Important
A previously saved broken Ending SE whose only remaining reference is an expired `blob:` URL cannot be reconstructed from that URL. Re-select the Ending SE file once in V2.21; subsequent `.scene` export/import and publish use the managed asset path.
