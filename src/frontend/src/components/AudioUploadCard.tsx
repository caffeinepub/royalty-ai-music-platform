import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAddAudioFile } from '@/hooks/useAudioLibrary';
import { ExternalBlob } from '@/backend';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AudioUploadCard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const { mutate: addAudioFile, isPending } = useAddAudioFile();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|ogg|webm)$/i)) {
      setError('Please select a valid audio file (MP3, WAV, OGG, or WebM)');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      setError('Please provide a title and select a file');
      return;
    }

    try {
      setError('');
      setUploadProgress(0);

      // Read file as bytes
      const arrayBuffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Create ExternalBlob with progress tracking
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      addAudioFile(
        { title: title.trim(), description: description.trim(), file: blob },
        {
          onSuccess: () => {
            toast.success('Audio Uploaded!', {
              description: `${title} has been added to your library`,
            });
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            setUploadProgress(0);
          },
          onError: (error: any) => {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload audio file');
            setUploadProgress(0);
          },
        }
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload audio file');
      setUploadProgress(0);
    }
  };

  return (
    <Card className="glass-panel border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-cyan-400" />
          Upload Audio
        </CardTitle>
        <CardDescription>
          Upload your audio files to use with Mix & Master and other tools
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Audio Track"
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            rows={3}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Audio File *</Label>
          <Input
            id="file"
            type="file"
            accept="audio/*,.mp3,.wav,.ogg,.webm"
            onChange={handleFileSelect}
            disabled={isPending}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPending && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={isPending || !selectedFile || !title.trim()}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
        >
          {isPending ? (
            <>
              <Upload className="mr-2 h-4 w-4 animate-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Audio
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
