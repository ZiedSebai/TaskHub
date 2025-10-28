import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { ThemeSwitcher } from './theme-switcher';
import { Button } from './ui/button';
import { LayoutDashboard, Users, LogOut, FolderKanban } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                  <FolderKanban className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  TaskHub
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-1">
                <Button
                  asChild
                  variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9"
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                {user?.role === 'admin' && (
                  <Button
                    asChild
                    variant={isActive('/admin/users') ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-9"
                  >
                    <Link to="/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.email.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <ThemeSwitcher />
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-9">
                <LogOut className="h-4 w-4 mr-2 sm:mr-0 lg:mr-2" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex items-center gap-2 mt-3 pt-3 border-t">
            <Button
              asChild
              variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
              size="sm"
              className="flex-1 h-9"
            >
              <Link to="/dashboard">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Projects
              </Link>
            </Button>
            {user?.role === 'admin' && (
              <Button
                asChild
                variant={isActive('/admin/users') ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-9"
              >
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
      
      {children}
    </div>
  );
}

