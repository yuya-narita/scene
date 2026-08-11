# v0.2.37
Fixes Easy → Advanced reconciliation order.

The prior v0.2.36 logic grouped no-text/media Scenes by a count of preceding text Scenes.
Deleting the first Easy text changed that count and moved the first media-only Scene to
the front, producing 33 Scenes with the wrong order.

v0.2.37 walks the original Scene array in order. Media/Advanced-only Scenes remain in
their original slots. Easy text edits are applied around those anchored Scenes.
