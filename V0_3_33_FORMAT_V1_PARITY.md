# Public Player v0.3.33 — Format v1 parity

Synced to the current Scene Format v1 Studio contract.

## Added Player parity
- authored LF line breaks: cover title / ending label / Scene text / subtext
- text color / shadow / line-height / letter-spacing / opacity / side margin / alignment
- custom effect duration / delay
- disappear timing + stay/up motion
- background tone light/dark
- background transition duration
- background monochrome on the actual image layer
- existing audio v1 command model retained

## Compatibility
- Scene Format remains `version: 1.0`
- no breaking document migration
- unknown extension fields remain tolerated

Next recommended step: run one Format-sync test `.scene` in Studio Preview and this public Player side-by-side.
