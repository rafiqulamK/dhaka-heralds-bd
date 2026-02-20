import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Video, Image, Tag, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/dhaka-heralds-logo.jpg';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Articles', path: '/admin/articles' },
  { icon: Video, label: 'Videos', path: '/admin/videos' },
  { icon: Image, label: 'Media Library', path: '/admin/media' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const Sidebar = () => (
    <aside className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Dhaka Heralds" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/50" />
          <div>
            <div className="text-sm font-bold gold-text">Dhaka Heralds</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === path
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-3 truncate">{user?.email}</div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted"
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen sticky top-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 h-full"><Sidebar /></div>
          <div className="flex-1 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden bg-card border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu size={20} />
          </button>
          <span className="font-bold gold-text text-sm">Dhaka Heralds Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
