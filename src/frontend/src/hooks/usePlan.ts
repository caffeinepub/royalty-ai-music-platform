import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PlanType } from '@/backend';

export function useUpdateCallerPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPlan: PlanType) => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getCallerUserProfile();
      if (!profile) throw new Error('Profile not found');
      
      const updatedProfile = {
        ...profile,
        plan: newPlan,
        exportsRemaining: getExportsForPlan(newPlan),
      };
      
      return actor.saveCallerUserProfile(updatedProfile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

function getExportsForPlan(plan: PlanType): bigint {
  switch (plan) {
    case PlanType.free:
      return BigInt(5);
    case PlanType.creator:
      return BigInt(50);
    case PlanType.studio:
      return BigInt(100);
    case PlanType.full:
      return BigInt(999999); // Unlimited
    default:
      return BigInt(5);
  }
}
