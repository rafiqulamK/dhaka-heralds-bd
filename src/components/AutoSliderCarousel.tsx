import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
  view_count?: number | null;
  categories?: { name: string; slug: string } | null;
}

interface AutoSliderCarouselProps {
  articles: Article[];
  interval?: number;
}

// Category-specific fallback images from Unsplash
const CATEGORY_IMAGES: Record<string, string> = {
  bangladesh: 'https://images.unsplash.com/photo-1617634382730-9d0e6f4b0e09?w=600&q=80',
  world: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80',
  politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80',
  business: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
  sports: 'https://images.unsplash.com/photo-1461896836934-bd45ba8bf8bd?w=600&q=80',
  culture: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=600&q=80',
  science: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=80',
  health: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
  entertainment: 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?w=600&q=80',
};

const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

function getArticleImage(article: Article): string {
  if (article.cover_image_url) return article.cover_image_url;
  const catSlug = article.categories?.slug?.toLowerCase() || '';
  return CATEGORY_IMAGES[catSlug] || DEFAULT_IMG;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AutoSliderCarousel({ articles }: AutoSliderCarouselProps) {
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const animRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const CARD_WIDTH = 320;
  const totalWidth = articles.length * CARD_WIDTH;

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!paused && delta < 100) {
      setOffset(prev => {
        const next = prev + 0.5 * (delta / 16);
        return next >= totalWidth ? 0 : next;
      });
    }
    animRef.current = requestAnimationFrame(animate);
  }, [paused, totalWidth]);

  useEffect(() => {
    if (articles.length === 0) return;
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate, articles.length]);

  if (articles.length === 0) return null;

  const displayArticles = [...articles, ...articles, ...articles];

  return (
    <div
      className="overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div className="flex gap-4" style={{ transform: `translateX(-${offset}px)` }}>
        {displayArticles.map((article, i) => (
          <Link
            key={`${article.id}-${i}`}
            to={`/article/${article.slug}`}
            className="shrink-0 w-[300px] group rounded-2xl overflow-hidden border border-border bg-card card-hover"
          >
            <div className="aspect-[16/9] overflow-hidden relative">
              <img
                src={getArticleImage(article)}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMG; }}
              />
              {article.categories && (
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {article.categories.name}
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{article.excerpt}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                {article.published_at && (
                  <span className="flex items-center gap-1"><Clock size={10} />{timeAgo(article.published_at)}</span>
                )}
                {article.view_count != null && (
                  <span className="flex items-center gap-1"><Eye size={10} />{article.view_count.toLocaleString()}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
