import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import AppShell from '@/components/AppShell';
import HeaderNav from '@/components/HeaderNav';
import AuthorizationErrorState from '@/components/AuthorizationErrorState';
import { useGetCallerAudioFiles } from '@/hooks/useAudioLibrary';
import { useExportUsage } from '@/hooks/useExportUsage';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Play, Pause, Download, Wand2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { processAudio, downloadAudio } from '@/lib/audioProcessing';

export default function MixMasterPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { audioTitle?: string };
  const { data: audioFiles, isLoading, error, refetch } = useGetCallerAudioFiles();
  const { mutate: triggerExport, isPending: isExporting } = useExportUsage();
  const { isAdminSessionActive } = useAdminSession();

  const [selectedAudioTitle, setSelectedAudioTitle] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [gain, setGain] = useState(1.0);
  const [lowEQ, setLowEQ] = useState(0);
  const [midEQ, setMidEQ] = useState(0);
  const [highEQ, setHighEQ] = useState(0);
  const [processing, setProcessing] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lowShelfRef = useRef<BiquadFilterNode | null>(null);
  const midPeakRef = useRef<BiquadFilterNode | null>(null);
  const highShelfRef = useRef<BiquadFilterNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  // Set initial audio from URL parameter
  useEffect(() => {
    if (search.audioTitle && audioFiles) {
      const file = audioFiles.find((f) => f.title === search.audioTitle);
      if (file) {
        setSelectedAudioTitle(file.title);
      }
    }
  }, [search.audioTitle, audioFiles]);

  const selectedAudio = audioFiles?.find((f) => f.title === selectedAudioTitle);

  // Load audio when selected
  useEffect(() => {
    if (!selectedAudio) return;

    const loadAudio = async () => {
      try {
        setProcessing(true);
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        // Fetch audio data
        const response = await fetch(selectedAudio.file.getDirectURL());
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBufferRef.current = audioBuffer;

        // Create audio nodes
        gainNodeRef.current = audioContext.createGain();
        lowShelfRef.current = audioContext.createBiquadFilter();
        midPeakRef.current = audioContext.createBiquadFilter();
        highShelfRef.current = audioContext.createBiquadFilter();

        // Configure filters
        lowShelfRef.current.type = 'lowshelf';
        lowShelfRef.current.frequency.value = 200;
        midPeakRef.current.type = 'peaking';
        midPeakRef.current.frequency.value = 1000;
        midPeakRef.current.Q.value = 1;
        highShelfRef.current.type = 'highshelf';
        highShelfRef.current.frequency.value = 3000;

        setProcessing(false);
        toast.success('Audio Loaded', {
          description: 'Ready to mix and master',
        });
      } catch (error) {
        console.error('Error loading audio:', error);
        setProcessing(false);
        toast.error('Load Failed', {
          description: 'Failed to load audio file',
        });
      }
    };

    loadAudio();

    return () => {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [selectedAudio]);

  // Update audio parameters
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = gain;
    }
  }, [gain]);

  useEffect(() => {
    if (lowShelfRef.current) {
      lowShelfRef.current.gain.value = lowEQ;
    }
  }, [lowEQ]);

  useEffect(() => {
    if (midPeakRef.current) {
      midPeakRef.current.gain.value = midEQ;
    }
  }, [midEQ]);

  useEffect(() => {
    if (highShelfRef.current) {
      highShelfRef.current.gain.value = highEQ;
    }
  }, [highEQ]);

  const handlePlayPause = () => {
    if (!audioContextRef.current || !audioBufferRef.current) return;

    if (isPlaying) {
      // Stop playback
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current = null;
      }
      setIsPlaying(false);
    } else {
      // Start playback
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;

      // Connect nodes: source -> low -> mid -> high -> gain -> destination
      source.connect(lowShelfRef.current!);
      lowShelfRef.current!.connect(midPeakRef.current!);
      midPeakRef.current!.connect(highShelfRef.current!);
      highShelfRef.current!.connect(gainNodeRef.current!);
      gainNodeRef.current!.connect(audioContextRef.current.destination);

      source.onended = () => {
        setIsPlaying(false);
        sourceNodeRef.current = null;
      };

      source.start();
      sourceNodeRef.current = source;
      setIsPlaying(true);
    }
  };

  const handleExport = async () => {
    if (!audioBufferRef.current || !audioContextRef.current) {
      toast.error('Export Failed', {
        description: 'No audio loaded',
      });
      return;
    }

    try {
      setProcessing(true);

      // Process audio with current settings
      const processedBuffer = await processAudio(
        audioBufferRef.current,
        audioContextRef.current.sampleRate,
        { gain, lowEQ, midEQ, highEQ }
      );

      // Use export (for non-admins) - call the mutation
      triggerExport(undefined, {
        onSuccess: () => {
          // Download the processed audio
          downloadAudio(processedBuffer, `${selectedAudioTitle}_mixed.wav`);
          toast.success('Export Complete!', {
            description: isAdminSessionActive
              ? 'Your mixed audio has been downloaded (admin unlimited)'
              : 'Your mixed audio has been downloaded',
          });
          setProcessing(false);
        },
        onError: (error: any) => {
          console.error('Export error:', error);
          toast.error('Export Failed', {
            description: error.message || 'Failed to export audio',
          });
          setProcessing(false);
        },
      });
    } catch (error: any) {
      console.error('Processing error:', error);
      toast.error('Processing Failed', {
        description: error.message || 'Failed to process audio',
      });
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <HeaderNav />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppShell>
    );
  }

  // Show error state if audio library query failed
  if (error) {
    return (
      <AppShell>
        <HeaderNav />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/dashboard' })}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">
                Mix & Master
              </span>
            </h1>
            <p className="text-muted-foreground">Professional audio mixing and mastering tools</p>
          </div>

          <AuthorizationErrorState
            error={error}
            onRetry={() => refetch()}
            variant="card"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <HeaderNav />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate({ to: '/dashboard' })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600">
              Mix & Master
            </span>
          </h1>
          <p className="text-muted-foreground">Professional audio mixing and mastering tools</p>
        </div>

        <div className="space-y-6">
          {/* Audio Selection */}
          <Card className="glass-panel border-purple-500/30">
            <CardHeader>
              <CardTitle>Select Audio</CardTitle>
            </CardHeader>
            <CardContent>
              {!audioFiles || audioFiles.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No audio files found. Please upload audio files in your{' '}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => navigate({ to: '/audio' })}
                    >
                      Audio Library
                    </Button>
                    .
                  </AlertDescription>
                </Alert>
              ) : (
                <Select value={selectedAudioTitle} onValueChange={setSelectedAudioTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an audio file..." />
                  </SelectTrigger>
                  <SelectContent>
                    {audioFiles.map((file) => (
                      <SelectItem key={file.title} value={file.title}>
                        {file.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {selectedAudio && (
            <>
              {/* Playback Controls */}
              <Card className="glass-panel border-cyan-500/30">
                <CardHeader>
                  <CardTitle>Playback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handlePlayPause}
                      disabled={processing || !audioBufferRef.current}
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-5 w-5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          Play
                        </>
                      )}
                    </Button>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedAudio.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {processing ? 'Loading...' : 'Ready to play'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mix Controls */}
              <Card className="glass-panel border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-400" />
                    Mix Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gain */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Gain / Volume</Label>
                      <span className="text-sm text-muted-foreground">{gain.toFixed(2)}x</span>
                    </div>
                    <Slider
                      value={[gain]}
                      onValueChange={([v]) => setGain(v)}
                      min={0}
                      max={2}
                      step={0.01}
                      disabled={processing}
                    />
                  </div>

                  {/* Low EQ */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Low EQ (Bass)</Label>
                      <span className="text-sm text-muted-foreground">{lowEQ > 0 ? '+' : ''}{lowEQ} dB</span>
                    </div>
                    <Slider
                      value={[lowEQ]}
                      onValueChange={([v]) => setLowEQ(v)}
                      min={-12}
                      max={12}
                      step={1}
                      disabled={processing}
                    />
                  </div>

                  {/* Mid EQ */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Mid EQ</Label>
                      <span className="text-sm text-muted-foreground">{midEQ > 0 ? '+' : ''}{midEQ} dB</span>
                    </div>
                    <Slider
                      value={[midEQ]}
                      onValueChange={([v]) => setMidEQ(v)}
                      min={-12}
                      max={12}
                      step={1}
                      disabled={processing}
                    />
                  </div>

                  {/* High EQ */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>High EQ (Treble)</Label>
                      <span className="text-sm text-muted-foreground">{highEQ > 0 ? '+' : ''}{highEQ} dB</span>
                    </div>
                    <Slider
                      value={[highEQ]}
                      onValueChange={([v]) => setHighEQ(v)}
                      min={-12}
                      max={12}
                      step={1}
                      disabled={processing}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Export */}
              <Card className="glass-panel border-pink-500/30">
                <CardHeader>
                  <CardTitle>Export</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isAdminSessionActive && (
                    <Alert className="border-purple-500/50 bg-purple-500/10">
                      <CheckCircle className="h-4 w-4 text-purple-400" />
                      <AlertDescription className="text-purple-400">
                        Admin mode: Unlimited exports available
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={handleExport}
                    disabled={processing || isExporting || !audioBufferRef.current}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                    size="lg"
                  >
                    {processing || isExporting ? (
                      <>
                        <Download className="mr-2 h-5 w-5 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-5 w-5" />
                        Export Mixed Audio
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Exports as WAV format with your current mix settings applied
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
