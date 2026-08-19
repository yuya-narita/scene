# v0.3.58 Rights Claim Form

- Player report dialog upgraded from a reason-only report to a rights claim form.
- Collects reason, affected material, evidence/original URL, details, contact email, and accuracy confirmation.
- Evidence URL and contact email are required for copyright/unauthorized-use claims; optional for Other.
- Worker validates and stores the new fields in reports/*.json.
- Admin inbox displays affected material, claim details, evidence link, and contact address.
- Existing reports remain readable and are marked as legacy/information-insufficient when they lack the new fields.
