import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import AppShell from '@/components/AppShell';
import HeaderNav from '@/components/HeaderNav';
import ToolLauncher from '@/components/ToolLauncher';
import UpgradePlanCard from '@/components/UpgradePlanCard';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useCurrentUserProfile';
import { useAdminSession } from '@/hooks/useAdminSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Music, Download, Shield, Library } from 'lucide-react';
import { getEffectivePlan, getEffectivePlanDisplayName } from '@/lib/planUtils';

export default function UserDashboardPage() {
  const { identity } = useInternetIdentity();
  const { isAdminSessionActive } = useAdminSession();
  const navigate = useNavigate();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (profileLoading) {
    return (
      <AppShell>
        <HeaderNav />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!userProfile) {
    return null;
  }

  // Compute effective plan for UI display (Full Package for admins)
  const effectivePlan = getEffectivePlan(userProfile.plan, isAdminSessionActive);
  const effectivePlanDisplayName = getEffectivePlanDisplayName(userProfile.plan, isAdminSessionActive);

  return (
    <AppShell>
      <HeaderNav />
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                Welcome, {userProfile.name}
              </span>
            </h1>
            {isAdminSessionActive && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600">
                <Shield className="h-3 w-3 mr-1" />
                Admin Mode
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">Your AI music creation dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-panel border-cyan-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
              <Music className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{effectivePlanDisplayName}</div>
              <p className="text-xs text-muted-foreground mt-2">
                {isAdminSessionActive ? 'Admin access with all features' : 'Your subscription tier'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exports Remaining</CardTitle>
              <Download className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdminSessionActive ? '∞' : Number(userProfile.exportsRemaining)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {isAdminSessionActive ? 'Unlimited exports' : 'This month'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-panel border-pink-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Audio Library</CardTitle>
              <Library className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate({ to: '/audio' })}
                className="w-full mt-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Library className="mr-2 h-4 w-4" />
                My Audio
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tools - Takes 2 columns */}
          <div className="lg:col-span-2">
            <ToolLauncher currentPlan={effectivePlan} isAdminMode={isAdminSessionActive} />
          </div>

          {/* Upgrade Card - Takes 1 column */}
          <div className="lg:col-span-1">
            <UpgradePlanCard currentPlan={effectivePlan} isAdminMode={isAdminSessionActive} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
