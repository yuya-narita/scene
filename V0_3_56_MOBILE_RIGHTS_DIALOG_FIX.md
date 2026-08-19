# v0.3.56 Mobile rights-dialog fix

- Public Player: iPhone report dialog close control is explicitly normalized so the × remains visible instead of rendering as an empty blue focus box.
- Studio: publish-rights checkbox is exempted from the global `input { width:100%; height:54px; }` rule.
- Studio mobile publish dialog uses a 20px checkbox + flexible text column, preventing the confirmation sentence from collapsing into a narrow vertical strip.
- Desktop layout is unchanged apart from the checkbox sizing safeguard.
