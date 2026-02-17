import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteAudioFile } from '@/hooks/useAudioLibrary';
import { AudioFile } from '@/backend';
import { Music, Trash2, Wand2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MyAudioListProps {
  audioFiles: AudioFile[];
}

export default function MyAudioList({ audioFiles }: MyAudioListProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<AudioFile | null>(null);

  const { mutate: deleteAudioFile, isPending: isDeleting } = useDeleteAudioFile();

  const handleDelete = (file: AudioFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!fileToDelete) return;

    deleteAudioFile(fileToDelete, {
      onSuccess: () => {
        toast.success('Audio Deleted', {
          description: `${fileToDelete.title} has been removed from your library`,
        });
        setDeleteDialogOpen(false);
        setFileToDelete(null);
      },
      onError: (error: any) => {
        console.error('Delete error:', error);
        toast.error('Delete Failed', {
          description: error.message || 'Failed to delete audio file',
        });
      },
    });
  };

  const handleOpenInMixMaster = (file: AudioFile) => {
    // Navigate to Mix & Master with the file
    navigate({ to: '/tools/mix-master', search: { audioTitle: file.title } });
  };

  if (audioFiles.length === 0) {
    return (
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Your Audio Files</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Music className="h-4 w-4" />
            <AlertDescription>
              No audio files yet. Upload your first audio file to get started!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Your Audio Files ({audioFiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {audioFiles.map((file, index) => (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Music className="h-4 w-4 text-cyan-400 shrink-0" />
                      <h3 className="font-semibold truncate">{file.title}</h3>
                    </div>
                    {file.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{file.description}</p>
                    )}
                    <audio
                      controls
                      src={file.file.getDirectURL()}
                      className="w-full mt-3 h-8"
                      preload="metadata"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenInMixMaster(file)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    >
                      <Wand2 className="h-4 w-4 mr-1" />
                      Mix & Master
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(file)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass-panel">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio File?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
