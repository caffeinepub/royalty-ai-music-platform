import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AppShell from '@/components/AppShell';
import HeaderNav from '@/components/HeaderNav';
import AudioUploadCard from '@/components/AudioUploadCard';
import MyAudioList from '@/components/MyAudioList';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerAudioFiles } from '@/hooks/useAudioLibrary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, AlertCircle, LogIn, ArrowLeft } from 'lucide-react';

export default function MyAudioPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: audioFiles, isLoading } = useGetCallerAudioFiles();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <AppShell>
        <HeaderNav />
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Card className="glass-panel border-cyan-500/30 max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    Sign In Required
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please sign in with Internet Identity to access your audio library.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  size="lg"
                >
                  {isLoggingIn ? (
                    <>
                      <Music className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in with Internet Identity
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <HeaderNav />
      <div className="container max-w-6xl mx-auto px-4 py-8">
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              My Audio Library
            </span>
          </h1>
          <p className="text-muted-foreground">Upload and manage your audio files</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AudioUploadCard />
          </div>

          <div className="lg:col-span-2">
            {isLoading ? (
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>Your Audio Files</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ) : (
              <MyAudioList audioFiles={audioFiles || []} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
