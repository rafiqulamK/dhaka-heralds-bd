import { Link } from 'react-router-dom';
import { Search, Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
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

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top bar */}
      <div className="bg-primary px-4 py-1.5 flex items-center justify-between text-primary-foreground text-xs">
        <div className="flex items-center gap-2">
          <Globe size={12} />
          <span className="font-medium tracking-wider uppercase">Dhaka Heralds — International News & Documentary Portal</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-primary-foreground/80">
          <span>{new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Main header */}
      <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Dhaka Heralds" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/50" />
          <div className="hidden sm:block">
            <div className="text-xl font-bold gold-text leading-tight">Dhaka Heralds</div>
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
        </div>
      )}
    </header>
  );
}
