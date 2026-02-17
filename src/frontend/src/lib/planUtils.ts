import { PlanType } from '@/backend';

export function getPlanDisplayName(plan: PlanType): string {
  switch (plan) {
    case PlanType.free:
      return 'Free';
    case PlanType.creator:
      return 'Creator';
    case PlanType.studio:
      return 'Studio';
    case PlanType.full:
      return 'Full Package';
    default:
      return 'Unknown';
  }
}

/**
 * Returns the effective plan for UI display purposes.
 * When admin session is active, returns Full Package regardless of stored plan.
 * Otherwise returns the actual user plan.
 */
export function getEffectivePlan(actualPlan: PlanType, isAdminSessionActive: boolean): PlanType {
  return isAdminSessionActive ? PlanType.full : actualPlan;
}

/**
 * Returns the display name for the effective plan.
 * Convenience wrapper around getEffectivePlan + getPlanDisplayName.
 */
export function getEffectivePlanDisplayName(actualPlan: PlanType, isAdminSessionActive: boolean): string {
  const effectivePlan = getEffectivePlan(actualPlan, isAdminSessionActive);
  return getPlanDisplayName(effectivePlan);
}
