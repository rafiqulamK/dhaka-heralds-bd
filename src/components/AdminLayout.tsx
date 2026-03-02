import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, FileText, Video, Image, Tag, LogOut, Menu, X, ChevronRight, Globe, Share2 } from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/dhaka-heralds-logo.jpg';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: FileText, label: 'Articles', path: '/admin/articles' },
  { icon: Video, label: 'Videos', path: '/admin/videos' },
  { icon: Image, label: 'Media Library', path: '/admin/media' },
  { icon: Tag, label: 'Categories', path: '/admin/categories' },
  { icon: Share2, label: 'Social Media', path: '/admin/social' },
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
    <aside className="w-64 h-full bg-card/80 backdrop-blur-xl border-r border-border flex flex-col">
      <div className="p-5 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Dhaka Heralds" className="h-10 w-10 rounded-xl object-cover ring-1 ring-border" />
          <div>
            <div className="text-sm font-bold text-foreground tracking-tight">Dhaka Heralds</div>
            <div className="text-[10px] text-muted-foreground tracking-widest uppercase">CMS</div>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* View Site link */}
      <div className="px-3 pb-2">
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60 transition-colors"
        >
          <Globe size={14} />
          <span>View Site</span>
        </Link>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{user?.email}</p>
            <p className="text-[10px] text-muted-foreground">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-3 py-2 rounded-xl hover:bg-destructive/10"
        >
          <LogOut size={14} /> Sign Out
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
        <header className="md:hidden bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu size={20} />
          </button>
          <span className="font-bold text-foreground text-sm tracking-tight">Dhaka Heralds CMS</span>
        </header>
        <main className="flex-1 p-4 md:p-8 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}
