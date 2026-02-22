import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ExternalLink, ShieldCheck, ShieldAlert, HelpCircle, RefreshCw, Loader2 } from 'lucide-react';

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

export default function TrendingNews() {
  const [stories, setStories] = useState<TrendingStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('firecrawl-news', {
        body: { query: 'top trending international news today 2026', category: 'world', limit: 8 },
      });
      if (fnError) throw fnError;
      if (data?.success && data.data) {
        setStories(data.data.slice(0, 8));
        setLastFetched(new Date());
      } else {
        setError(data?.error || 'Failed to fetch trending news');
      }
    } catch (e) {
      console.error('Trending fetch error:', e);
      setError('Unable to fetch trending news. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrending();
  }, []);

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
          <button onClick={fetchTrending} className="mt-3 text-sm text-primary hover:underline flex items-center gap-1 mx-auto">
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
              Updated {lastFetched.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchTrending}
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
          {stories.map((story, i) => (
            <a
              key={i}
              href={story.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card rounded-xl gold-border overflow-hidden card-hover flex flex-col"
            >
              {story.image_url ? (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <TrendingUp size={24} className="text-primary/30" />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {story.category}
                  </span>
                  <span className="flex items-center gap-1 text-[10px]" title={FACT_LABELS[story.fact_check_status]}>
                    {FACT_ICONS[story.fact_check_status]}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors mb-1">
                  {story.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{story.excerpt}</p>
                <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
                  <span className="font-medium">{story.source}</span>
                  <ExternalLink size={10} />
                </div>
              </div>
            </a>
          ))}
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
