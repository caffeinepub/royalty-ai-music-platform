import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanType } from '@/backend';
import { Wand2, Mic, Music, Radio, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiredPlan: PlanType;
  route?: string;
}

const tools: Tool[] = [
  {
    id: 'mix-master',
    name: 'Mix & Master',
    description: 'Professional audio mixing and mastering',
    icon: <Wand2 className="h-6 w-6" />,
    requiredPlan: PlanType.free,
    route: '/tools/mix-master',
  },
  {
    id: 'ai-creator',
    name: 'AI Music Creator',
    description: 'Generate original music with AI',
    icon: <Music className="h-6 w-6" />,
    requiredPlan: PlanType.creator,
  },
  {
    id: 'voice-transform',
    name: 'Voice Transform',
    description: 'Transform your voice with AI',
    icon: <Mic className="h-6 w-6" />,
    requiredPlan: PlanType.studio,
  },
  {
    id: 'distribution',
    name: 'Platform Distribution',
    description: 'Distribute to streaming platforms',
    icon: <Radio className="h-6 w-6" />,
    requiredPlan: PlanType.full,
  },
];

interface ToolLauncherProps {
  currentPlan: PlanType;
  isAdminMode?: boolean;
}

const planOrder = {
  [PlanType.free]: 0,
  [PlanType.creator]: 1,
  [PlanType.studio]: 2,
  [PlanType.full]: 3,
};

export default function ToolLauncher({ currentPlan, isAdminMode = false }: ToolLauncherProps) {
  const navigate = useNavigate();

  const isToolUnlocked = (tool: Tool): boolean => {
    if (isAdminMode) return true;
    return planOrder[currentPlan] >= planOrder[tool.requiredPlan];
  };

  const handleToolClick = (tool: Tool) => {
    const unlocked = isToolUnlocked(tool);

    if (!unlocked) {
      toast.error('Upgrade Required', {
        description: `This tool requires a higher plan. Please upgrade to access ${tool.name}.`,
      });
      return;
    }

    if (tool.route) {
      navigate({ to: tool.route });
    } else {
      toast.info('Coming Soon', {
        description: `${tool.name} is currently in development`,
      });
    }
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-2xl">Music Tools</CardTitle>
        <CardDescription>
          {isAdminMode
            ? 'All tools unlocked in admin mode'
            : 'Create, mix, and master your music with AI-powered tools'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const unlocked = isToolUnlocked(tool);
            return (
              <Card
                key={tool.id}
                className={`border-border/50 transition-all ${
                  unlocked
                    ? 'hover:border-cyan-500/50 cursor-pointer'
                    : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => handleToolClick(tool)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={unlocked ? 'text-cyan-400' : 'text-muted-foreground'}>
                      {tool.icon}
                    </div>
                    {!unlocked && !isAdminMode && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                    {isAdminMode && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-600">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{tool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{tool.description}</p>
                  {!unlocked && !isAdminMode && (
                    <Badge variant="outline" className="text-xs">
                      Upgrade Required
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
