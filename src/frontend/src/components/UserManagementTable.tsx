import { useState } from 'react';
import { Principal } from '@icp-sdk/core/principal';
import { useUpdateUserPlan } from '@/hooks/useAdminData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanType, UserProfile } from '@/backend';
import { getPlanDisplayName } from '@/lib/planUtils';
import { toast } from 'sonner';

interface UserWithPrincipal {
  principal: Principal;
  profile: UserProfile;
}

interface UserManagementTableProps {
  users: UserWithPrincipal[];
}

export default function UserManagementTable({ users }: UserManagementTableProps) {
  const { mutate: updateUserPlan, isPending } = useUpdateUserPlan();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);

  const handleUpdatePlan = (principal: Principal) => {
    if (!selectedPlan) return;

    updateUserPlan(
      { user: principal, plan: selectedPlan },
      {
        onSuccess: () => {
          toast.success('Plan Updated', {
            description: 'User plan has been updated successfully',
          });
          setEditingUser(null);
          setSelectedPlan(null);
        },
        onError: () => {
          toast.error('Update Failed', {
            description: 'Failed to update user plan',
          });
        },
      }
    );
  };

  const getPlanBadgeColor = (plan: PlanType) => {
    switch (plan) {
      case PlanType.free:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      case PlanType.creator:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case PlanType.studio:
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case PlanType.full:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      default:
        return '';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border/50">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Exports Remaining</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const principalStr = user.principal.toString();
            const isEditing = editingUser === principalStr;

            return (
              <TableRow key={principalStr}>
                <TableCell className="font-mono text-xs">
                  {principalStr.slice(0, 8)}...{principalStr.slice(-6)}
                </TableCell>
                <TableCell>{user.profile.name}</TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={selectedPlan || user.profile.plan}
                      onValueChange={(value) => setSelectedPlan(value as PlanType)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PlanType.free}>Free</SelectItem>
                        <SelectItem value={PlanType.creator}>Creator</SelectItem>
                        <SelectItem value={PlanType.studio}>Studio</SelectItem>
                        <SelectItem value={PlanType.full}>Full</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={getPlanBadgeColor(user.profile.plan)}>
                      {getPlanDisplayName(user.profile.plan)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{Number(user.profile.exportsRemaining)}</TableCell>
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdatePlan(user.principal)}
                        disabled={isPending}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(null);
                          setSelectedPlan(null);
                        }}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUser(principalStr);
                        setSelectedPlan(user.profile.plan);
                      }}
                    >
                      Edit Plan
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
