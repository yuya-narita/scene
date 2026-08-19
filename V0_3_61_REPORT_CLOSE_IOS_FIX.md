# v0.3.61 — REPORT CLOSE iOS FIX

- Changed the report-dialog close control from a submit button to `type="button"`.
- Closing the report dialog no longer invokes native required-field validation.
- Added iOS touch/pointer isolation so the terminating tap cannot fall through to a form field after the modal closes.
- Blurs the active form field before closing.
- Public report form contents and Worker API are unchanged.
