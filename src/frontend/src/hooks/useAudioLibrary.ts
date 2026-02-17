import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { AudioFile, ExternalBlob } from '@/backend';

export function useGetCallerAudioFiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<AudioFile[]>({
    queryKey: ['callerAudioFiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerAudioFiles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddAudioFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, description, file }: { title: string; description: string; file: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addAudioFile(title, description, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerAudioFiles'] });
    },
  });
}

export function useDeleteAudioFile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audioFile: AudioFile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteAudioFile(audioFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerAudioFiles'] });
    },
  });
}
