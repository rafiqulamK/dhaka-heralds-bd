import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, RefreshCw, Loader2, ExternalLink, Clock } from 'lucide-react';

interface TrendingStory {
  title: string;
  excerpt: string;
  source: string;
  source_url: string;
  category: string;
  image_url: string | null;
  importance: number;
  published_approx?: string;
}

const CACHE_KEY = 'dh_trending_cache';
const CACHE_TTL = 15 * 60 * 1000;

function getCached(): { stories: TrendingStory[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
  } catch {}
  return null;
}

export default function TrendingNews() {
  const [stories, setStories] = useState<TrendingStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const animRef = useRef<number>();
  const lastTimeRef = useRef(0);

  const fetchTrending = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached();
      if (cached) { setStories(cached.stories); return; }
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('firecrawl-news', {
        body: { query: 'top trending international news today 2026', category: 'world', limit: 20 },
      });
      if (fnError) throw fnError;
      if (data?.success && data.data) {
        const final = (data.data as TrendingStory[]).slice(0, 16);
        setStories(final);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ stories: final, ts: Date.now() })); } catch {}
      } else {
        setError('Failed to fetch trending news');
      }
    } catch (e) {
      console.error('Trending fetch error:', e);
      setError('Unable to fetch trending news.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  useEffect(() => {
    const timer = setInterval(() => fetchTrending(true), 30000);
    return () => clearInterval(timer);
  }, [fetchTrending]);

  const totalWidth = stories.length * 290;
  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;
    if (!paused && delta < 100) {
      setScrollOffset(prev => {
        const next = prev + 0.4 * (delta / 16);
        return next >= totalWidth ? 0 : next;
      });
    }
    animRef.current = requestAnimationFrame(animate);
  }, [paused, totalWidth]);

  useEffect(() => {
    if (stories.length === 0) return;
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animate, stories.length]);

  const placeholderImg = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80';

  if (error && stories.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1 h-7 bg-primary rounded-full" />
          <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Trending Now
          </h2>
        </div>
        <div className="bg-card rounded-2xl p-8 border border-border text-center">
          <p className="text-muted-foreground text-sm">{error}</p>
          <button onClick={() => fetchTrending(true)} className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 mx-auto font-medium">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </section>
    );
  }

  if (stories.length === 0 && !loading) return null;

  const displayStories = [...stories, ...stories, ...stories];

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-7 bg-primary rounded-full" />
        <h2 className="text-xl font-bold gradient-text flex items-center gap-2">
          <TrendingUp size={20} className="text-primary" /> Trending Now
        </h2>
        <span className="flex-1 h-px bg-border" />
        <button onClick={() => fetchTrending(true)} disabled={loading} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50 font-medium">
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Refresh
        </button>
      </div>

      {loading && stories.length === 0 ? (
        <div className="flex gap-5 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-[270px] bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="h-32 bg-muted animate-pulse rounded-xl" />
              <div className="h-4 bg-muted animate-pulse rounded-lg w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="overflow-hidden relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex gap-5" style={{ transform: `translateX(-${scrollOffset}px)` }}>
            {displayStories.map((story, i) => (
              <a
                key={i}
                href={story.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 w-[270px] bg-card rounded-2xl border border-border overflow-hidden card-hover flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={story.image_url || placeholderImg}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
                  />
                  <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider bg-primary/90 text-primary-foreground px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {story.category}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1">{story.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{story.excerpt}</p>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                    <span className="font-medium">{story.source}</span>
                    <ExternalLink size={10} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
