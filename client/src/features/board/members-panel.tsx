import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Users } from 'lucide-react';
import type { User } from '../../types';

interface MembersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Array<{ userId: string; user: User; role: string }>;
}

export function MembersPanel({ open, onOpenChange, members }: MembersPanelProps) {
  // Safe members array with filtering out invalid entries
  const validMembers = (members || []).filter(member => member?.user?.email);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Project Members</DialogTitle>
          <DialogDescription>
            View all members of this project
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
  );
}