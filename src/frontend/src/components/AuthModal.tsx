import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, User, AlertCircle, LogIn, CheckCircle } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'user' | 'admin';
}

export default function AuthModal({ open, onOpenChange, defaultTab = 'user' }: AuthModalProps) {
  const { login, loginStatus, identity, isLoginError } = useInternetIdentity();
  const { login: adminLogin, error: adminError } = useAdminSession();
  const navigate = useNavigate();
  const [adminPassword, setAdminPassword] = useState('');
  const [localAdminError, setLocalAdminError] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [userLoginError, setUserLoginError] = useState('');
  const [adminPasswordValidated, setAdminPasswordValidated] = useState(false);
  const [adminNeedsII, setAdminNeedsII] = useState(false);

  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;

  // Effect to handle successful login and navigation
  useEffect(() => {
    if (loginAttempted && identity && loginStatus === 'success') {
      // Identity is now available, close modal and navigate
      onOpenChange(false);
      navigate({ to: '/dashboard' });
      setLoginAttempted(false);
      setUserLoginError('');
    }
  }, [loginAttempted, identity, loginStatus, onOpenChange, navigate]);

  // Effect to handle login errors
  useEffect(() => {
    if (loginAttempted && isLoginError) {
      setUserLoginError('Login failed or was cancelled. Please try again.');
      setLoginAttempted(false);
    }
  }, [loginAttempted, isLoginError]);

  // Effect to handle admin II login success
  useEffect(() => {
    if (adminNeedsII && identity && loginStatus === 'success') {
      // Admin has completed II login
      onOpenChange(false);
      navigate({ to: '/admin' });
      setAdminNeedsII(false);
      setAdminPasswordValidated(false);
    }
  }, [adminNeedsII, identity, loginStatus, onOpenChange, navigate]);

  const handleUserLogin = async () => {
    try {
      setUserLoginError('');
      setLoginAttempted(true);
      
      // If already authenticated, treat as success
      if (identity) {
        onOpenChange(false);
        navigate({ to: '/dashboard' });
        setLoginAttempted(false);
        return;
      }
      
      await login();
      // Don't navigate here - wait for identity to be available via useEffect
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginAttempted(false);
      
      // Handle "already authenticated" case gracefully
      if (error.message?.includes('already authenticated')) {
        if (identity) {
          // If we have identity, just proceed
          onOpenChange(false);
          navigate({ to: '/dashboard' });
        } else {
          setUserLoginError('Session conflict detected. Please refresh the page and try again.');
        }
      } else if (error.message?.includes('popup') || error.message?.includes('closed') || error.message?.includes('cancel')) {
        setUserLoginError('Login was cancelled. Please try again.');
      } else {
        setUserLoginError('An error occurred during login. Please try again.');
      }
    }
  };

  const handleAdminPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalAdminError('');
    
    // Trim the password before validating
    const success = adminLogin(adminPassword.trim());
    if (success) {
      setAdminPassword('');
      setAdminPasswordValidated(true);
      
      // Check if already authenticated with II
      if (isAuthenticated) {
        // Already have II, go straight to admin
        onOpenChange(false);
        navigate({ to: '/admin' });
        setAdminPasswordValidated(false);
      } else {
        // Need II authentication
        setAdminNeedsII(true);
      }
    } else {
      setLocalAdminError('Invalid admin password');
    }
  };

  const handleAdminIILogin = async () => {
    try {
      setLocalAdminError('');
      await login();
      // Navigation handled by useEffect
    } catch (error: any) {
      console.error('Admin II login error:', error);
      if (error.message?.includes('popup') || error.message?.includes('closed') || error.message?.includes('cancel')) {
        setLocalAdminError('Login was cancelled. Please try again.');
      } else {
        setLocalAdminError('An error occurred during login. Please try again.');
      }
    }
  };

  const handleRetryLogin = () => {
    setUserLoginError('');
    handleUserLogin();
  };

  const handleRetryAdminII = () => {
    setLocalAdminError('');
    handleAdminIILogin();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-panel border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              Welcome to ROYALTY
            </span>
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to start creating amazing music
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4 mt-4">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sign in with Internet Identity to access your dashboard and tools
              </p>

              {userLoginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{userLoginError}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={userLoginError ? handleRetryLogin : handleUserLogin}
                disabled={isLoggingIn}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                size="lg"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    {userLoginError ? 'Retry Login' : 'Sign in with Internet Identity'}
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="admin" className="space-y-4 mt-4">
            {!adminPasswordValidated ? (
              <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="border-purple-500/50 focus:border-purple-500"
                  />
                </div>

                {(localAdminError || adminError) && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{localAdminError || adminError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  size="lg"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Admin Access
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Admin password verified! Now sign in with Internet Identity to access admin features.
                  </AlertDescription>
                </Alert>

                <p className="text-sm text-muted-foreground text-center">
                  Admin features require Internet Identity authentication for security.
                </p>

                {localAdminError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{localAdminError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={localAdminError ? handleRetryAdminII : handleAdminIILogin}
                  disabled={isLoggingIn}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  size="lg"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {localAdminError ? 'Retry Internet Identity Login' : 'Sign in with Internet Identity'}
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
