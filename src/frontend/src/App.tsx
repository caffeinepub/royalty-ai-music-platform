import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useAdminSession } from './hooks/useAdminSession';
import LandingPage from './pages/LandingPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyAudioPage from './pages/MyAudioPage';
import MixMasterPage from './pages/MixMasterPage';
import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

// Route guard for user-only routes
function UserRouteGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for initialization to complete
    if (isInitializing) return;
    
    // Only redirect if we've confirmed no identity after initialization
    if (!identity && !hasChecked) {
      setHasChecked(true);
      navigate({ to: '/' });
    } else if (identity) {
      setHasChecked(true);
    }
  }, [identity, isInitializing, navigate, hasChecked]);

  // Show loading skeleton while initializing or checking
  if (isInitializing || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  // Show nothing if no identity (will redirect)
  if (!identity) return null;
  
  return <>{children}</>;
}

// Route guard for admin-only routes
function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { isAdminSessionActive, isReady } = useAdminSession();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Wait for admin session to be ready (initialized from storage)
    if (!isReady) return;
    
    if (!isAdminSessionActive && !hasChecked) {
      setHasChecked(true);
      navigate({ to: '/' });
    } else if (isAdminSessionActive) {
      setHasChecked(true);
    }
  }, [isAdminSessionActive, isReady, navigate, hasChecked]);

  // Show loading skeleton while checking
  if (!isReady || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  // Show nothing if no admin session (will redirect)
  if (!isAdminSessionActive) return null;
  
  return <>{children}</>;
}

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});

// Landing page route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

// User dashboard route
const userDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <UserRouteGuard>
      <UserDashboardPage />
    </UserRouteGuard>
  ),
});

// Admin dashboard route
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AdminRouteGuard>
      <AdminDashboardPage />
    </AdminRouteGuard>
  ),
});

// My Audio route
const myAudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/audio',
  component: () => (
    <UserRouteGuard>
      <MyAudioPage />
    </UserRouteGuard>
  ),
});

// Mix & Master tool route
const mixMasterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/mix-master',
  component: () => (
    <UserRouteGuard>
      <MixMasterPage />
    </UserRouteGuard>
  ),
});

// Create router
const routeTree = rootRoute.addChildren([
  indexRoute,
  userDashboardRoute,
  adminDashboardRoute,
  myAudioRoute,
  mixMasterRoute,
]);
const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
