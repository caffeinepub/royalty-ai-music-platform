# Specification

## Summary
**Goal:** Make admin mode fully usable by preventing backend access-control initialization failures and by showing clear, actionable in-app error states when admin actions or data loads fail.

**Planned changes:**
- Frontend: Add a consistent admin dashboard error state that renders an in-app error card when admin data fetches fail, showing an English message/title, raw error details in a copyable section, and a one-click Retry action to rerun the failed requests.
- Frontend: Detect/admin-handle authorization-related failures and display a dedicated “Admin authorization required” message explaining that the Internet Identity principal is not authorized yet and that the app must be opened with the `caffeineAdminToken` parameter.
- Backend: Harden access-control initialization so that providing an empty/missing `caffeineAdminToken` does not trap or block normal authenticated usage; keep existing behavior when a valid token is provided.

**User-visible outcome:** Admins no longer hit a blank/broken dashboard due to “error code” failures; instead they see clear English error messages with copyable details and a Retry button, and authorization issues explicitly explain how to proceed (including the `caffeineAdminToken` requirement).
