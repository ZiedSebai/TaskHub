import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Users, UserPlus } from 'lucide-react';
import type { User } from '../../types';
import { AddMemberDialog } from './add-member-dialog';

interface MembersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Array<{ userId: string; user: User; role: string }>;
  projectId: string;
  onMembersChange: () => void;
}

export function MembersPanel({ open, onOpenChange, members, projectId, onMembersChange }: MembersPanelProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const validMembers = (members || []).filter(member => member?.user?.email);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogClose onClose={() => onOpenChange(false)} />
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Project Members</span>
              <Button
                size="sm"
                onClick={() => setShowAddMember(true)}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTitle>
            <DialogDescription>
              View and manage members of this project
            </DialogDescription>
          </DialogHeader>
        <div className="space-y-2">
          {validMembers.length > 0 ? (
            validMembers.map((member) => (
              <div key={member.userId || member.user?.email} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {member.user?.email?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.user?.email || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role || 'member'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No members in this project yet</p>
            </div>
          )}
        </div>
        </DialogContent>
      </Dialog>

      <AddMemberDialog
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        projectId={projectId}
        currentMembers={validMembers}
        onMemberAdded={() => {
          onMembersChange();
          setShowAddMember(false);
        }}
      />
    </>
  );
}