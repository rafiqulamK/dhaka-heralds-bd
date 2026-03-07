import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ShieldCheck, ShieldAlert, HelpCircle, RefreshCw, Loader2, ExternalLink, Clock } from 'lucide-react';

interface TrendingStory {
  title: string;
  excerpt: string;
  source: string;
  source_url: string;
  category: string;
  image_url: string | null;
  importance: number;
  fact_check_status: 'verified' | 'partially_verified' | 'unverified';
  published_approx?: string;
}

const FACT_ICONS = {
  verified: <ShieldCheck size={14} className="text-accent" />,
  partially_verified: <ShieldAlert size={14} className="text-primary" />,
  unverified: <HelpCircle size={14} className="text-muted-foreground" />,
};

const FACT_LABELS = {
  verified: 'Verified',
  partially_verified: 'Partially Verified',
  unverified: 'Unverified',
};

const CACHE_KEY = 'dh_trending_cache';
const CACHE_TTL = 15 * 60 * 1000;
const REFRESH_INTERVAL = 30 * 1000; // 30 seconds

function getCached(): { stories: TrendingStory[]; ts: number } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts < CACHE_TTL) return parsed;
  } catch {}
  return null;
}

function setCache(stories: TrendingStory[]) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ stories, ts: Date.now() })); } catch {}
}

export default function TrendingNews() {
  const [stories, setStories] = useState<TrendingStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  const animRef = useRef<number>();
  const lastTimeRef = useRef(0);

  const fetchTrending = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached();
      if (cached) { setStories(cached.stories); setLastFetched(new Date(cached.ts)); return; }
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
        setLastFetched(new Date());
        setCache(final);
      } else {
        setError(data?.error || 'Failed to fetch trending news');
      }
    } catch (e) {
      console.error('Trending fetch error:', e);
      setError('Unable to fetch trending news.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrending(); }, [fetchTrending]);

  // Auto-refresh every 30s
  useEffect(() => {
    const timer = setInterval(() => fetchTrending(true), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchTrending]);

  // Smooth auto-scroll animation
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
          <span className="w-1 h-6 bg-primary rounded" />
          <h2 className="text-xl font-bold gold-text flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Trending Now
          </h2>
        </div>
        <div className="bg-card rounded-xl p-6 gold-border text-center">
          <p className="text-muted-foreground text-sm">{error}</p>
          <button onClick={() => fetchTrending(true)} className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </section>
    );
  }

  const displayStories = [...stories, ...stories, ...stories];

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-6 bg-primary rounded" />
        <h2 className="text-xl font-bold gold-text flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Trending Now
        </h2>
        <span className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-2">
          {lastFetched && <span className="text-xs text-muted-foreground">{lastFetched.toLocaleTimeString()}</span>}
          <button onClick={() => fetchTrending(true)} disabled={loading} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50">
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Refresh
          </button>
        </div>
      </div>

      {loading && stories.length === 0 ? (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 w-[270px] bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="h-32 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="overflow-hidden relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex gap-4" style={{ transform: `translateX(-${scrollOffset}px)` }}>
            {displayStories.map((story, i) => {
              const isExpanded = expandedIdx === i;
              return (
                <div
                  key={i}
                  className="shrink-0 w-[270px] bg-card rounded-xl border border-border overflow-hidden card-hover flex flex-col cursor-pointer"
                  onClick={() => setExpandedIdx(isExpanded ? null : i)}
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={story.image_url || placeholderImg}
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onError={(e) => { (e.target as HTMLImageElement).src = placeholderImg; }}
                    />
                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {story.category}
                    </span>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1" title={FACT_LABELS[story.fact_check_status]}>
                      {FACT_ICONS[story.fact_check_status]}
                      {FACT_LABELS[story.fact_check_status]}
                    </div>
                    <h3 className="text-xs font-bold text-foreground line-clamp-2 mb-1">{story.title}</h3>
                    <p className={`text-[11px] text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'} flex-1`}>{story.excerpt}</p>
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-border space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock size={10} />
                          <span>{story.published_approx ? new Date(story.published_approx).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}</span>
                        </div>
                        <a href={story.source_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                          Read at {story.source} <ExternalLink size={9} />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                      <span className="font-medium">{story.source}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground italic text-center mt-3">
        🤖 AI-curated • Auto-refreshes every 30s • Verify with primary sources
      </p>
    </section>
  );
}
