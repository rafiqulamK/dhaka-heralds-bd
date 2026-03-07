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

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AutoSliderCarousel({ articles, interval = 4000 }: AutoSliderCarouselProps) {
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const SPEED = 0.5; // pixels per frame (~30px/s)

  const totalWidth = articles.length * 320; // card width + gap

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (!paused && delta < 100) {
      setOffset(prev => {
        const next = prev + SPEED * (delta / 16);
        return next >= totalWidth ? 0 : next;
      });
    }
    animRef.current = requestAnimationFrame(animate);
  }, [paused, totalWidth]);

  useEffect(() => {
    if (articles.length === 0) return;
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate, articles.length]);

  if (articles.length === 0) return null;

  // Duplicate articles for seamless loop
  const displayArticles = [...articles, ...articles, ...articles];
  const placeholderImg = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80';

  return (
    <div
      ref={containerRef}
      className="overflow-hidden relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-4"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {displayArticles.map((article, i) => (
          <Link
            key={`${article.id}-${i}`}
            to={`/article/${article.slug}`}
            className="shrink-0 w-[300px] group rounded-2xl overflow-hidden border border-border bg-card card-hover"
          >
            <div className="aspect-[16/9] overflow-hidden relative">
              <img
                src={article.cover_image_url || placeholderImg}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
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
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
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
