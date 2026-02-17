import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { PlanType, UserProfile } from '@/backend';
import { Principal } from '@icp-sdk/core/principal';

interface AdminStats {
  totalUsers: bigint;
  freeCount: bigint;
  creatorCount: bigint;
  studioCount: bigint;
  fullCount: bigint;
}

export function useGetAdminStats(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const [users, freeCount, creatorCount, studioCount, fullCount] = await Promise.all([
        actor.getAllUsers(),
        actor.getUserCountByPlan(PlanType.free),
        actor.getUserCountByPlan(PlanType.creator),
        actor.getUserCountByPlan(PlanType.studio),
        actor.getUserCountByPlan(PlanType.full),
      ]);

      return {
        totalUsers: BigInt(users.length),
        freeCount,
        creatorCount,
        studioCount,
        fullCount,
      };
    },
    enabled: !!actor && !actorFetching && enabled,
  });
}

export function useGetAllUsersWithProfiles(enabled: boolean = true) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{ principal: Principal; profile: UserProfile }>>({
    queryKey: ['allUsersWithProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const users = await actor.getAllUsers();
      const profiles = await actor.getAllUserProfiles();
      
      return users.map((principal, index) => ({
        principal,
        profile: profiles[index],
      }));
    },
    enabled: !!actor && !actorFetching && enabled,
  });
}

export function useUpdateUserPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, plan }: { user: Principal; plan: PlanType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserPlan(user, plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['allUsersWithProfiles'] });
    },
  });
}
