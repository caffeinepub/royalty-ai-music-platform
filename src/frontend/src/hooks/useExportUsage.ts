import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';

export function useExportUsage() {
  const { actor } = useActor();
  const { isAdminSessionActive } = useAdminSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Admin bypass: don't call backend for admins
      if (isAdminSessionActive) {
        return;
      }

      if (!actor) throw new Error('Actor not available');
      return actor.useExport();
    },
    onSuccess: () => {
      // Invalidate user profile to refresh export count
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
