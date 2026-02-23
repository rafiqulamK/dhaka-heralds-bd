import { Link, useLocation } from 'react-router-dom';
import { Flame, Globe, Building2, Cpu, Trophy, Palette, Landmark, Clapperboard } from 'lucide-react';

const categories = [
  { name: 'All', slug: '', icon: Flame },
  { name: 'Bangladesh', slug: 'bangladesh', icon: Globe },
  { name: 'World', slug: 'world', icon: Globe },
  { name: 'Politics', slug: 'politics', icon: Landmark },
  { name: 'Business', slug: 'business', icon: Building2 },
  { name: 'Technology', slug: 'technology', icon: Cpu },
  { name: 'Sports', slug: 'sports', icon: Trophy },
  { name: 'Culture', slug: 'culture', icon: Palette },
  { name: 'Documentaries', slug: 'documentaries', icon: Clapperboard },
];

export default function CategoryTabs() {
  const { pathname } = useLocation();
  const activeSlug = pathname.startsWith('/category/') ? pathname.split('/')[2] : '';

  return (
    <div className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-[105px] z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          {categories.map(({ name, slug, icon: Icon }) => {
            const isActive = slug === activeSlug;
            const to = slug ? `/category/${slug}` : '/';
            return (
              <Link
                key={slug}
                to={to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={14} />
                {name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
