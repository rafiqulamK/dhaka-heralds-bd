import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ShieldCheck, ShieldAlert, HelpCircle, RefreshCw, Loader2, ChevronDown, ChevronUp, ExternalLink, Clock } from 'lucide-react';

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
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ stories, ts: Date.now() }));
  } catch {}
}

export default function TrendingNews() {
  const [stories, setStories] = useState<TrendingStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const fetchTrending = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached();
      if (cached) {
        setStories(cached.stories);
        setLastFetched(new Date(cached.ts));
        return;
      }
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('firecrawl-news', {
        body: { query: 'top trending international news today 2026', category: 'world', limit: 12 },
      });
      if (fnError) throw fnError;
      if (data?.success && data.data) {
        // Only keep stories with images
        const withImages = (data.data as TrendingStory[]).filter(s => s.image_url);
        const final = withImages.slice(0, 8);
        setStories(final);
        setLastFetched(new Date());
        setCache(final);
      } else {
        setError(data?.error || 'Failed to fetch trending news');
      }
    } catch (e) {
      console.error('Trending fetch error:', e);
      setError('Unable to fetch trending news. Try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

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

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-6 bg-primary rounded" />
        <h2 className="text-xl font-bold gold-text flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Trending Now
        </h2>
        <span className="flex-1 h-px bg-border" />
        <div className="flex items-center gap-2">
          {lastFetched && (
            <span className="text-xs text-muted-foreground">
              {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => fetchTrending(true)}
            disabled={loading}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Refresh
          </button>
        </div>
      </div>

      {loading && stories.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl gold-border p-4 space-y-3">
              <div className="h-32 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stories.map((story, i) => {
            const isExpanded = expandedIdx === i;
            return (
              <div
                key={i}
                className="bg-card rounded-xl gold-border overflow-hidden card-hover flex flex-col cursor-pointer"
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img
                    src={story.image_url!}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).closest('.aspect-\\[16\\/9\\]')?.classList.add('hidden'); }}
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5 rounded">
                      {story.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground" title={FACT_LABELS[story.fact_check_status]}>
                      {FACT_ICONS[story.fact_check_status]}
                      {FACT_LABELS[story.fact_check_status]}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1">
                    {story.title}
                  </h3>
                  <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'} flex-1`}>{story.excerpt}</p>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        <span>{story.published_approx ? new Date(story.published_approx).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}</span>
                      </div>
                      <a
                        href={story.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        Read full article at {story.source} <ExternalLink size={10} />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                    <span className="font-medium">{story.source}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 text-center">
        <p className="text-[10px] text-muted-foreground italic">
          🤖 AI-curated from multiple sources • Fact-check status is AI-estimated • Always verify with primary sources
        </p>
      </div>
    </section>
  );
}
