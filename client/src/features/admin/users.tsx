import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Shield, Users as UsersIcon, Crown } from 'lucide-react';

export function Users() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.list,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-muted-foreground mt-1">Manage all platform users</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <UsersIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card className="border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                    <Crown className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admins</p>
                    <p className="text-2xl font-bold">{adminCount}</p>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* User List */}
        <Card className="max-w-4xl mx-auto shadow-xl">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UsersIcon className="h-6 w-6 text-primary" />
              All Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {users && users.length > 0 ? (
              <div className="divide-y">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-semibold">
                            {user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-base">{user.email}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {user.role || 'Member'}
                          </p>
                        </div>
                      </div>
                      {user.role === 'admin' && (
                        <span className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-orange-500/10 text-orange-500 rounded-full">
                          <Crown className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

