# Web Expression v0.1

Experimental branch based on scene-main (28).

## Added
- `presentation.view: "web-board"`
- `presentation.webBoard`: number / name / date / userId / replyTo
- Board rendering in root, Studio, Local Player, and player-test Player Core copies
- Desktop Studio board metadata editor
- Existing Scene `text` remains the post body, so content falls back safely

## Intentionally untouched
- commerce / Stripe
- CAGE / AI
- chat speaker data
- relay / bookshelf / account flows

This is a prototype. Do not overwrite the main branch wholesale; merge the Web Expression diff only after validation.
