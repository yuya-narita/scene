# AHAKO Expressive Text Effects V2.10

Audio regression fix focused on the reported iPhone test case.

- Scene 1 SE / Scene 2 SE: stopped priming future real SE sources. Reusable one-shot Audio elements are used for both manual and AUTO playback, preventing future-Scene SE leakage and reread duplication.
- AUTO BGM / Ambient: future persistent elements are authorized with a physically silent WAV, never the real source. AUTO timers start only after the silent unlock attempts settle, so priming cleanup cannot pause Scene 2 playback.
- Ending SE: removed the separate pointerdown/dedicated-ending path. Ending SE now uses the same stable one-shot bank from finish(); manual finish remains in the final click gesture, AUTO uses the pre-authorized bank.
- Public Player reread: old shell listeners are removed before mounting the next Core instance.
- Existing V2.9 visual effects and exit fade remain intact.
