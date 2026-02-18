# Specification

## Summary
**Goal:** Allow authenticated admins to use core app user flows without being blocked by user-only permission checks, and show clear frontend errors when admin authorization is missing.

**Planned changes:**
- Update the Motoko backend access-control logic so authenticated admin principals can call core user-flow methods (profile, exports, audio library) without trapping on `#user` permission checks.
- Ensure the backend access-control initialization entrypoint does not trap or break subsequent authenticated usage when invoked with an empty secret.
- Keep non-admin principals restricted from admin-only endpoints.
- Improve frontend error handling on Admin Dashboard and user tool pages to show clear, English, actionable authorization errors (including retry) when backend calls are blocked, without modifying immutable frontend paths (including `frontend/src/hooks/useActor.ts`).

**User-visible outcome:** Admins can sign in and use profile, exports, and audio library features normally; if backend admin authorization is missing, the UI displays a clear English message with next steps (e.g., using `caffeineAdminToken`) and a way to retry instead of appearing non-functional.
