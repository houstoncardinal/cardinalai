import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollaboration } from '@/hooks/useCollaboration';
import { Users, Trash2, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProjectSharingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

export const ProjectSharingDialog = ({
  open,
  onOpenChange,
  projectId,
}: ProjectSharingDialogProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer');
  const { members, loading, inviteMember, updateMemberRole, removeMember } =
    useCollaboration(projectId);

  const handleInvite = async () => {
    await inviteMember(email, role);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share Project
          </DialogTitle>
          <DialogDescription>
            Invite team members to collaborate on this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Invite Form */}
          <div className="space-y-3">
            <Label htmlFor="email">Invite by email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInvite} disabled={!email || loading}>
                <Mail className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <Label>Team Members ({members.length})</Label>
            <ScrollArea className="h-[200px] rounded-md border p-3">
              {members.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No team members yet
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {member.profile?.display_name?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.profile?.display_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{member.profile?.username || 'unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {member.role === 'owner' ? (
                          <Badge variant="secondary">Owner</Badge>
                        ) : (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(v) =>
                                updateMemberRole(member.id, v as any)
                              }
                            >
                              <SelectTrigger className="w-[100px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">Viewer</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
