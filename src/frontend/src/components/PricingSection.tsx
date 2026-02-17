import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  onOpenAuth: (tab: 'user' | 'admin') => void;
}

const plans = [
  {
    name: 'FREE',
    price: '$0',
    period: '/month',
    features: [
      'AI Music Creator',
      'Basic Mix & Master',
      '5 Exports/Month',
      'Standard Quality',
    ],
    buttonText: 'GET STARTED',
    popular: false,
  },
  {
    name: 'CREATOR',
    price: '$19',
    period: '/month',
    features: [
      'Advanced AI Creator',
      'Unlimited Mix & Master',
      '50 Exports/Month',
      'Priority Processing',
    ],
    buttonText: 'SUBSCRIBE',
    popular: false,
  },
  {
    name: 'STUDIO',
    price: '$29',
    period: '/month',
    features: [
      'Everything in Creator',
      'Voice Transform',
      '100 Exports/Month',
      'Commercial License',
    ],
    buttonText: 'SUBSCRIBE',
    popular: true,
  },
  {
    name: 'FULL PACKAGE',
    price: '$39',
    period: '/month',
    features: [
      'Everything in Studio',
      'Platform Distribution',
      'Unlimited Exports',
      'Priority Support',
    ],
    buttonText: 'SUBSCRIBE',
    popular: false,
  },
];

export default function PricingSection({ onOpenAuth }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 px-4">
      <div className="container max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
              PRICING
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your music journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`glass-panel relative ${
                plan.popular 
                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' 
                  : 'border-border/50'
              }`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white"
                >
                  MOST POPULAR
                </Badge>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold mb-4">{plan.name}</CardTitle>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700'
                      : 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-600 hover:to-blue-700'
                  }`}
                  onClick={() => onOpenAuth('user')}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
