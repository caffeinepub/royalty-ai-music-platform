import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Animated grid background */}
      <div 
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: 'url(/assets/generated/neon-grid-tile.dim_1024x1024.png)',
          backgroundSize: '512px 512px',
          backgroundRepeat: 'repeat',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
