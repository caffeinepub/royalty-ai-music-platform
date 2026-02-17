import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Sliders, Mic, Rocket, Zap, Award } from 'lucide-react';

const features = [
  {
    icon: Music,
    title: 'AI Music Creator',
    description: 'Generate original music tracks using advanced AI algorithms. Create beats, melodies, and full compositions in minutes.',
    color: 'text-cyan-400',
  },
  {
    icon: Sliders,
    title: 'Mix & Master',
    description: 'Professional-grade mixing and mastering powered by AI. Get studio-quality sound without the studio.',
    color: 'text-blue-400',
  },
  {
    icon: Mic,
    title: 'Voice Transform',
    description: 'Transform and enhance vocals with AI-powered processing. Create unique vocal effects and styles.',
    color: 'text-purple-400',
  },
  {
    icon: Rocket,
    title: 'Distribute',
    description: 'Publish your music to Spotify, Apple Music, and more. One-click distribution to all major platforms.',
    color: 'text-pink-400',
  },
  {
    icon: Zap,
    title: 'Fast Processing',
    description: 'Lightning-fast AI processing. Get your tracks ready in minutes, not hours.',
    color: 'text-yellow-400',
  },
  {
    icon: Award,
    title: 'Studio Quality',
    description: 'Professional results every time. AI trained on millions of tracks from top producers.',
    color: 'text-green-400',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              FEATURES
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to create professional music
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="glass-panel border-border/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
