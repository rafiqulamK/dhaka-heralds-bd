import { Link } from 'react-router-dom';
import { Search, Menu, X, Globe, Sun, Moon, Languages } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import logo from '@/assets/dhaka-heralds-logo.jpg';

const categories = [
  { name: 'Bangladesh', slug: 'bangladesh' },
  { name: 'World', slug: 'world' },
  { name: 'Politics', slug: 'politics' },
  { name: 'Business', slug: 'business' },
  { name: 'Documentaries', slug: 'documentaries' },
  { name: 'Culture', slug: 'culture' },
  { name: 'Sports', slug: 'sports' },
];

const socialLinks = [
  { name: 'Facebook', url: 'https://www.facebook.com/DhakaHerald', icon: 'f' },
  { name: 'Instagram', url: 'https://www.instagram.com/DhakaHerald', icon: 'ig' },
  { name: 'X', url: 'https://x.com/DhakaHeralds', icon: 'x' },
  { name: 'YouTube', url: 'https://youtube.com/@DhakaHeralds', icon: 'yt' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary px-4 py-1.5 flex items-center justify-between text-primary-foreground text-xs">
        <div className="flex items-center gap-2">
          <Globe size={12} />
          <span className="font-medium tracking-wider uppercase">Dhaka Heralds — International News & Documentary Portal</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-primary-foreground/80">
          {/* Social icons */}
          <div className="flex items-center gap-2">
            {socialLinks.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-foreground transition-colors" title={s.name}>
                <SocialIcon type={s.icon} size={14} />
              </a>
            ))}
          </div>
          <span className="text-primary-foreground/40">|</span>
          <span>{new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Dhaka Heralds" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/50" />
          <div className="hidden sm:block">
            <div className="text-xl font-bold text-primary leading-tight">Dhaka Heralds</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase">International News Portal</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-primary transition-colors hover:bg-muted rounded"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggle} className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {searchOpen ? (
            <form onSubmit={(e) => { e.preventDefault(); window.location.href = `/search?q=${searchQuery}`; }} className="flex items-center gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search news..."
                className="bg-muted border border-border rounded px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-1.5 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
              <Search size={18} />
            </button>
          )}
          <button className="lg:hidden p-2 text-muted-foreground hover:text-primary" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-4">
          <nav className="flex flex-col gap-1">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-muted rounded transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            {socialLinks.map(s => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" title={s.name}>
                <SocialIcon type={s.icon} size={18} />
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function SocialIcon({ type, size = 16 }: { type: string; size?: number }) {
  const s = size;
  switch (type) {
    case 'f': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>;
    case 'ig': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case 'x': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case 'yt': return <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    default: return null;
  }
}
