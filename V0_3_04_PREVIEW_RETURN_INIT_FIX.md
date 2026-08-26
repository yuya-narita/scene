# v0.3.04 — Preview return initialization fix

## Root cause
`#exportPackageButton` was removed from the current HTML when project I/O moved into the compact menu, but `script.js` still called `.addEventListener(...)` on it without a null guard.

That runtime error stopped the initialization sequence before the `#editReturnButton` click handler was registered. The Preview return button therefore looked correct but had no working handler.

## Fix
- Guard the removed legacy `#exportPackageButton` binding with optional chaining.
- Connect `#menuExportPackageButton` directly to `exportScenePackage()` instead of proxy-clicking the removed button.
- Keep the current Preview UI/chrome behavior unchanged.
