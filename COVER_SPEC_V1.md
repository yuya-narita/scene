# Scene Cover Specification v1

Cover is package metadata, not Scene 0.

## manifest.json
- title: required
- subtitle: optional
- author: optional
- language: optional
- series.title: optional
- series.episode: optional/free text
- cover.image: optional, internal package path only
- cover.fit: cover | contain
- cover.position: center | top | bottom
- entry: scene.json

Cover is excluded from PAST, progress, AUTO, and Scene count.
If cover.image is absent, a Player may render a text-only automatic cover.
