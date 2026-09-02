# AHAKO EXPRESSIVE TEXT EFFECTS V2.26

## Manga Balloon Canvas

- Replaced the V2.25 CSS-only balloon skin with responsive SVG geometry.
- Speech tails are drawn behind the body as one visual silhouette without the detached seam.
- Cloud balloons use a generated irregular perimeter and thought dots aimed at the speaker.
- Burst balloons generate a tooth count from the rendered width instead of stretching fixed teeth.
- Narration uses a restrained single frame without the previous double-border/drop-shadow treatment.

## Direct placement editor

- Drag the balloon directly over the real Scene background.
- Drag the blue handle to resize its width; height continues to follow the text.
- Drag the red speaker-point handle to aim the tail at a person or object in the background.
- Cancel, center/reset, and save controls are available in the editor.
- Geometry is stored as stage-relative percentages: `x`, `y`, `width`, `tailX`, and `tailY`.
- The same authored placement scales across iPhone and desktop Player sizes.

## Compatibility

- Positioned balloons remain anchored independently of normal Scene stack geometry.
- SLAM, BURST, GLITCH HIT, and RUSH animate the SVG skin with the text.
- Fragment disappear effects hide the SVG skin while temporary text fragments run.
- Inline text editing refreshes SVG geometry after text size changes.
- Chat view continues to use its dedicated chat bubble system.
- Audio, ending audio asset handling, viewport fixes, and public-player shell files are unchanged.
