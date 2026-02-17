import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { LogOut, User, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderNavProps {
  onOpenAuth?: (tab: 'user' | 'admin') => void;
}

export default function HeaderNav({ onOpenAuth }: HeaderNavProps) {
  const { identity, clear, isLoggingIn } = useInternetIdentity();
  const { isAdminSessionActive, logout: adminLogout } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    if (isAdminSessionActive) {
      adminLogout();
    }
    queryClient.clear();
    navigate({ to: '/' });
  };

  const handleLogin = () => {
    if (onOpenAuth) {
      onOpenAuth('user');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate({ to: '/' })}>
          <img 
            src="/assets/generated/royalty-wordmark.dim_1200x300.png" 
            alt="ROYALTY" 
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-cyan-500/50 hover:border-cyan-500">
                  {isAdminSessionActive ? (
                    <>
                      <Shield className="mr-2 h-4 w-4 text-cyan-400" />
                      Admin
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      Account
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!isAdminSessionActive && (
                  <DropdownMenuItem onClick={() => navigate({ to: '/dashboard' })}>
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                )}
                {isAdminSessionActive && (
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
