import { useState } from 'react';
import AppShell from '@/components/AppShell';
import HeaderNav from '@/components/HeaderNav';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Music, Sparkles } from 'lucide-react';

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'user' | 'admin'>('user');

  const handleOpenAuth = (tab: 'user' | 'admin' = 'user') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AppShell>
      <HeaderNav onOpenAuth={handleOpenAuth} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-0" />
        
        <div className="container max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-8 flex justify-center">
            <img 
              src="/assets/generated/royalty-wordmark.dim_1200x300.png" 
              alt="ROYALTY" 
              className="h-20 md:h-32 w-auto object-contain"
            />
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              CREATE
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400">
              MUSIC
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              WITH AI
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your sound with cutting-edge AI technology.
            <br />
            Mix, master, and create like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
              onClick={() => handleOpenAuth('user')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              START CREATING FREE
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 border-2 border-cyan-500/50 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all duration-300"
              onClick={scrollToPricing}
            >
              <Music className="mr-2 h-5 w-5" />
              VIEW PLANS
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection onOpenAuth={handleOpenAuth} />

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ROYALTY™ AI Music Platform. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a 
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </AppShell>
  );
}
