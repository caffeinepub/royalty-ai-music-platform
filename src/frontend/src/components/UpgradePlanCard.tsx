import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUpdateCallerPlan } from '@/hooks/usePlan';
import { PlanType } from '@/backend';
import { getPlanDisplayName } from '@/lib/planUtils';
import { ArrowUp, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface UpgradePlanCardProps {
  currentPlan: PlanType;
  isAdminMode?: boolean;
}

const planUpgrades = [
  { plan: PlanType.creator, price: 19, features: ['Advanced AI Creator', 'Unlimited Mix & Master', '50 Exports/Month'] },
  { plan: PlanType.studio, price: 29, features: ['Everything in Creator', 'Voice Transform', '100 Exports/Month'] },
  { plan: PlanType.full, price: 39, features: ['Everything in Studio', 'Platform Distribution', 'Unlimited Exports'] },
];

export default function UpgradePlanCard({ currentPlan, isAdminMode = false }: UpgradePlanCardProps) {
  const { mutate: updatePlan, isPending } = useUpdateCallerPlan();

  const handleUpgrade = (newPlan: PlanType) => {
    updatePlan(newPlan, {
      onSuccess: () => {
        toast.success('Plan Updated!', {
          description: `You've been upgraded to ${getPlanDisplayName(newPlan)}`,
        });
      },
      onError: () => {
        toast.error('Upgrade Failed', {
          description: 'Please try again later',
        });
      },
    });
  };

  // Admin mode shows special card
  if (isAdminMode) {
    return (
      <Card className="glass-panel border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You have admin access with all features unlocked and unlimited exports.
          </p>
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600">
            All Features Unlocked
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (currentPlan === PlanType.full) {
    return (
      <Card className="glass-panel border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-xl">You're on the best plan!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You have access to all features and unlimited exports.
          </p>
          <Badge className="bg-gradient-to-r from-cyan-500 to-purple-600">
            Full Package
          </Badge>
        </CardContent>
      </Card>
    );
  }

  const availableUpgrades = planUpgrades.filter((upgrade) => {
    const planOrder = { [PlanType.free]: 0, [PlanType.creator]: 1, [PlanType.studio]: 2, [PlanType.full]: 3 };
    return planOrder[upgrade.plan] > planOrder[currentPlan];
  });

  return (
    <Card className="glass-panel border-cyan-500/30">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-cyan-400" />
          Upgrade Your Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableUpgrades.map((upgrade) => (
          <Card key={upgrade.plan} className="border-border/50">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{getPlanDisplayName(upgrade.plan)}</CardTitle>
                  <p className="text-2xl font-bold mt-1">
                    ${upgrade.price}
                    <span className="text-sm text-muted-foreground">/month</span>
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2">
                {upgrade.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleUpgrade(upgrade.plan)}
                disabled={isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {isPending ? 'Upgrading...' : 'Upgrade Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
