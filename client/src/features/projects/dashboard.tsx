import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../api/projects';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Plus, FolderKanban, Users, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/auth-store';

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: () => projectsApi.create(projectName, projectDesc),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setCreateOpen(false);
      setProjectName('');
      setProjectDesc('');
      // Fix: Use _id if that's what MongoDB returns, or id
      const projectId = data._id || data.id;
      if (projectId) {
        navigate(`/board/${projectId}`);
      }
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    createProject();
  };

  const { user } = useAuthStore();

  // Add this helper function to safely get project ID
  const getProjectId = (project: any) => {
    return project._id || project.id;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome back{user?.email ? ', ' + user.email.split('@')[0] : ''}!
              </h1>
              <p className="text-muted-foreground mt-2">Manage your projects and tasks</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} size="lg" className="hidden sm:flex">
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading your projects...</p>
            </div>
          </div>
        ) : projects && projects.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {projects.map((project) => {
                const projectId = getProjectId(project);
                // Add safety check - skip if no valid ID
                if (!projectId) {
                  console.error('Project missing ID:', project);
                  return null;
                }
                
                return (
                  <Card
                    key={projectId}
                    className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-2 hover:border-primary/50"
                    onClick={() => navigate(`/board/${projectId}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center">
                          <FolderKanban className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <Users className="h-3 w-3" />
                          <span>{project.members?.length || 0}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl mb-2 line-clamp-1">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" size="sm" className="w-full group-hover:text-primary">
                        Open Board
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <div className="mt-6 sm:hidden">
              <Button onClick={() => setCreateOpen(true)} size="lg" className="w-full">
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-20">
            <Card className="max-w-md w-full border-dashed">
              <CardHeader className="text-center space-y-4 pb-8">
                <div className="mx-auto h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-2">No projects yet</CardTitle>
                  <CardDescription className="text-base">
                    Get started by creating your first project to organize your tasks
                  </CardDescription>
                </div>
                <div className="space-y-2 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Organize tasks efficiently
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Collaborate with team members
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Track project progress
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setCreateOpen(true)} size="lg" className="w-full">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Project
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogClose onClose={() => setCreateOpen(false)} />
            <DialogHeader>
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl text-center">Create New Project</DialogTitle>
              <DialogDescription className="text-center">
                Start organizing your tasks with a new project
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Project Name
                </label>
                <Input
                  id="name"
                  placeholder="My Awesome Project"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                  disabled={isPending}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="desc" className="text-sm font-medium">
                  Description <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  id="desc"
                  placeholder="What's this project about?"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  disabled={isPending}
                  className="h-11"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}