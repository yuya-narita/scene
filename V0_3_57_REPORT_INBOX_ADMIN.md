# v0.3.57 Report Inbox / Admin

- Player report modal now sends reports to Worker `/report`.
- Reports are stored in R2 under `reports/{reportId}.json`.
- Added admin report inbox API and resolve/reopen endpoints protected by `ADMIN_TOKEN`.
- Added `admin.html` small operations screen: report inbox, suspend, republish, complete delete, resolve, direct workId control.
- Existing publish/player flows remain unchanged.
