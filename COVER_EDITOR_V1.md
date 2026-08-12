# Cover Editor v1

Studio v0.2.14 adds a live cover renderer.

Saved design intent in manifest.cover:
- image (optional)
- fit: cover | contain
- position: center | top | bottom
- layout: center | bottom | minimal
- overlay: 0.0 - 0.8
- elements.series
- elements.episode
- elements.title
- elements.subtitle
- elements.author
- elements.start

These are responsive design hints, not pixel coordinates.
Cover is not Scene 0 and is excluded from PAST, progress, AUTO and Scene count.
