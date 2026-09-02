# AHAKO EXPRESSIVE TEXT EFFECTS V2.4

- Fix Public Player second-read freeze: `destroy({ preserveHost:true })` is now honored by Core, so the delayed destruction of the first Player cannot erase the newly mounted second Player DOM.
- Restore ending-page SE reliability: ending transition explicitly re-arms audio before firing `ending.audio` one-shot SE.
- V2.3 in-place SHATTER / EXPLODE behavior is preserved.
- No Splitter / Admin / Privacy changes.
