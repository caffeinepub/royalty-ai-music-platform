import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AppShell from '@/components/AppShell';
import AdminSidebar from '@/components/AdminSidebar';
import UserManagementTable from '@/components/UserManagementTable';
import { useAdminSession } from '@/hooks/useAdminSession';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetAdminStats, useGetAllUsersWithProfiles } from '@/hooks/useAdminData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, DollarSign, TrendingUp, RefreshCw, AlertCircle, LogIn } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function AdminDashboardPage() {
  const { isAdminSessionActive } = useAdminSession();
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';
  
  // Only enable queries when both admin session and Internet Identity are active
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetAdminStats(isAuthenticated);
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetAllUsersWithProfiles(isAuthenticated);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isAdminSessionActive) {
      navigate({ to: '/' });
    }
  }, [isAdminSessionActive, navigate]);

  // Auto-refresh every 5 seconds (only when authenticated)
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated) return;
    
    const interval = setInterval(() => {
      refetchStats();
      refetchUsers();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, refetchStats, refetchUsers]);

  const handleManualRefresh = () => {
    refetchStats();
    refetchUsers();
  };

  const handleInternetIdentityLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const revenue = stats ? (
    Number(stats.creatorCount) * 19 +
    Number(stats.studioCount) * 29 +
    Number(stats.fullCount) * 39
  ) : 0;

  // Show Internet Identity requirement if admin session is active but not authenticated
  if (!isAuthenticated) {
    return (
      <SidebarProvider>
        <AppShell>
          <div className="flex min-h-screen w-full">
            <AdminSidebar />
            
            <SidebarInset className="flex-1">
              <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-center items-center min-h-[60vh]">
                  <Card className="glass-panel border-cyan-500/30 max-w-md w-full">
                    <CardHeader>
                      <CardTitle className="text-2xl text-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                          Authentication Required
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          To use admin features, you must sign in with Internet Identity.
                        </AlertDescription>
                      </Alert>
                      <p className="text-sm text-muted-foreground text-center">
                        Admin access requires both admin session and Internet Identity authentication for security.
                      </p>
                      <Button
                        onClick={handleInternetIdentityLogin}
                        disabled={isLoggingIn}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                        size="lg"
                      >
                        {isLoggingIn ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
            </SidebarInset>
          </div>
        </AppShell>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppShell>
        <div className="flex min-h-screen w-full">
          <AdminSidebar />
          
          <SidebarInset className="flex-1">
            <div className="container max-w-7xl mx-auto px-4 py-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-bold mb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                      Admin Dashboard
                    </span>
                  </h1>
                  <p className="text-muted-foreground">Platform overview and user management</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualRefresh}
                    className="border-cyan-500/50 hover:border-cyan-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant={autoRefresh ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={autoRefresh ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                  >
                    Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                  <Skeleton className="h-32" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card className="glass-panel border-cyan-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-cyan-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.totalUsers ? Number(stats.totalUsers) : 0}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Free: {stats?.freeCount ? Number(stats.freeCount) : 0} | 
                        Creator: {stats?.creatorCount ? Number(stats.creatorCount) : 0} | 
                        Studio: {stats?.studioCount ? Number(stats.studioCount) : 0} | 
                        Full: {stats?.fullCount ? Number(stats.fullCount) : 0}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-purple-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${revenue.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Estimated from active subscriptions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-panel border-pink-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-pink-400" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats?.totalUsers && Number(stats.totalUsers) > 0
                          ? Math.round(((Number(stats.totalUsers) - Number(stats.freeCount)) / Number(stats.totalUsers)) * 100)
                          : 0}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Free to paid conversion
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* User Management Table */}
              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <UserManagementTable users={usersData || []} />
                  )}
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </AppShell>
    </SidebarProvider>
  );
}
