import { Link } from 'react-router-dom';
import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import logo from '@/assets/dhaka-heralds-logo.jpg';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggle } = useTheme();
  const { get } = useSiteSettings();

  const siteName = get('site_name', 'Dhaka Heralds');
  const tagline = get('site_tagline', 'International News');
  const logoUrl = get('logo_url') || logo;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bangladesh', path: '/category/bangladesh' },
    { name: 'World', path: '/category/world' },
    { name: 'Business', path: '/category/business' },
    { name: 'Fact-Check', path: '/fact-check' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-2 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img src={logoUrl} alt={siteName} className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover ring-1 ring-border group-hover:ring-primary/50 transition-all" />
          <div className="hidden sm:block">
            <span className="text-lg font-bold gradient-text tracking-tight">{siteName}</span>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase -mt-0.5">{tagline}</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3.5 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/60"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <PushNotificationToggle />
          <button onClick={toggle} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/60" title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {searchOpen ? (
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/search?q=${searchQuery}`; }} className="flex items-center gap-1.5">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="bg-muted border border-border rounded-xl px-3.5 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-xl hover:bg-muted/60">
              <Search size={18} />
            </button>
          )}

          <button className="lg:hidden p-2.5 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted/60" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border glass px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
