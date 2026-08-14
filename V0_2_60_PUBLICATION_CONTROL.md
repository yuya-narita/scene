Unpublish/Republish/Delete are now connected to R2 through the Worker.
Unpublish preserves the work and URL but blocks reading.
Republish restores the same URL.
Publishing edits reuses the same work ID.
Delete removes the hosted work JSON and state marker before removing the local draft.
Hosted assets are preserved intentionally for now.
