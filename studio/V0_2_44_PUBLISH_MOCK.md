# v0.2.44 — Publish UI Mock

- Built on v0.2.43.
- At normal preview end, a `公開する` CTA appears.
- AUTO REC never shows the publish CTA.
- Publish dialog states: ready / working / success / error.
- Mock adapter generates a test `https://scene.example/s/XXXXXXXX` URL.
- Success offers Web Share API (`シェア`) and clipboard (`リンクをコピー`).
- The future Hosting integration point is isolated in `publishAdapter.publish()`.
- No actual upload, R2, Worker, server, or hosting is performed in this build.
