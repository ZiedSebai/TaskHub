import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { usersApi } from '../../api/users';
import { projectsApi } from '../../api/projects';
import type { User } from '../../types';

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentMembers: Array<{ userId: string }>;
  onMemberAdded: () => void;
}

export function AddMemberDialog({ open, onClose, projectId, currentMembers, onMemberAdded }: AddMemberDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'member' | 'admin'>('member');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const users = await usersApi.search(query);
      const memberIds = new Set(currentMembers.map(m => m.userId));
      const filteredUsers = users.filter(u => !memberIds.has(u.id));
      setSearchResults(filteredUsers);
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    setIsAdding(true);
    try {
      await projectsApi.addMember(projectId, userId, selectedRole);
      onMemberAdded();
      setSearchQuery('');
      setSearchResults([]);
      onClose();
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. They may already be a member of this project.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Project Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Member Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as 'member' | 'admin')}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Search Users</label>
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={isAdding}
            />
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {isSearching && (
              <div className="text-sm text-muted-foreground text-center py-4">
                Searching...
              </div>
            )}

            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No users found
              </div>
            )}

            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent"
              >
                <div>
                  <div className="font-medium">{user.email}</div>
                  {user.role && (
                    <div className="text-xs text-muted-foreground">{user.role}</div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddMember(user.id)}
                  disabled={isAdding}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAdding}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
