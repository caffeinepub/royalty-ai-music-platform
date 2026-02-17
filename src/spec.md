# Specification

## Summary
**Goal:** Ensure admins are shown as having “Full Package” (unlimited access) across all user-facing plan displays and plan-derived UI, without changing the saved plan tier.

**Planned changes:**
- Add an “effective plan” UI layer for active admin sessions that resolves to “Full Package” for all plan labels/badges and plan-derived state shown in the user-facing interface.
- Update the User Dashboard “Current Plan” display (and any similar plan indicators) to use the effective plan when an admin session is active.
- Ensure ending the admin session restores UI plan displays to the actual stored profile plan tier.

**User-visible outcome:** When logged in with an active admin session, the dashboard and other user-facing areas show the admin as on “Full Package” (not Free); when the admin session ends, the UI returns to showing the true saved plan.
