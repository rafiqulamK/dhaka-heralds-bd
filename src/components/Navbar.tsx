import { Link } from 'react-router-dom';
import { Search, Menu, X, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import PushNotificationToggle from '@/components/PushNotificationToggle';
import logo from '@/assets/dhaka-heralds-logo.jpg';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggle } = useTheme();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Bangladesh', path: '/category/bangladesh' },
    { name: 'World', path: '/category/world' },
    { name: 'Business', path: '/category/business' },
    { name: 'Fact-Check', path: '/fact-check' },
    { name: 'About', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Logo — clean Apple News style */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={logo} alt="Dhaka Heralds" className="h-9 w-9 rounded-full object-cover" />
          <span className="text-lg font-bold text-primary hidden sm:block tracking-tight">Dhaka Heralds</span>
        </Link>

        {/* Desktop nav — minimal */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-0.5">
          <PushNotificationToggle />
          <button onClick={toggle} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted" title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {searchOpen ? (
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `/search?q=${searchQuery}`; }} className="flex items-center gap-1.5">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted">
              <Search size={18} />
            </button>
          )}

          <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-3">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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
