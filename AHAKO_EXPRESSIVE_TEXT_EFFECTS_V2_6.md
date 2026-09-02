# AHAKO Expressive Text Effects V2.6

- iPhone/Safari only: ending SE could stay silent even though Scene SE worked.
- Cause/workaround: Safari can reject a newly created ending one-shot when it is started from the later synthetic `click` after the physical touch.
- Ending one-shot is now started directly from the trusted `pointerdown` / `touchstart` of the final Scene tap.
- The visual ending transition still occurs on the normal click/next path.
- Added a per-reading guard so the same ending SE cannot play twice when `finish()` follows the trusted press.
- Ending-SE state is reset on load, cover start, restart and fresh reread.
- V2.5 one-screen iPhone layout and all V2.4/V2.3 expressive-effect fixes are retained.
