import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLocalInterests } from '@/components/OnboardingModal';
import { Sparkles, RefreshCw, Loader2, ChevronDown, ChevronUp, ExternalLink, Clock, ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';

interface ForYouStory {
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

const FACT_ICONS: Record<string, JSX.Element> = {
  verified: <ShieldCheck size={12} className="text-accent" />,
  partially_verified: <ShieldAlert size={12} className="text-primary" />,
  unverified: <HelpCircle size={12} className="text-muted-foreground" />,
};

const CACHE_KEY = 'dh_foryou_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes — reduces API calls

export default function ForYouFeed() {
  const [stories, setStories] = useState<ForYouStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const interests = getLocalInterests();

  const fetchForYou = useCallback(async (force = false) => {
    if (!force) {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Date.now() - parsed.ts < CACHE_TTL) {
            setStories(parsed.stories);
            return;
          }
        }
      } catch {}
    }

    if (interests.length === 0) return;
    setLoading(true);
    try {
      const query = interests.slice(0, 4).join(' OR ') + ' news today 2026';
      const { data, error } = await supabase.functions.invoke('firecrawl-news', {
        body: { query, category: interests[0], limit: 12 },
      });
      if (error) throw error;
      if (data?.success && data.data) {
        const withImages = (data.data as ForYouStory[]).filter(s => s.image_url).slice(0, 6);
        setStories(withImages);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ stories: withImages, ts: Date.now() })); } catch {}
      }
    } catch (e) {
      console.error('ForYou fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [interests]);

  useEffect(() => {
    if (interests.length > 0) fetchForYou();
  }, [fetchForYou]);

  if (interests.length === 0 && stories.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span className="w-1 h-6 bg-accent rounded" />
        <h2 className="text-xl font-bold gold-text flex items-center gap-2">
          <Sparkles size={18} className="text-accent" /> For You
        </h2>
        <span className="flex-1 h-px bg-border" />
        <button
          onClick={() => fetchForYou(true)}
          disabled={loading}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Refresh
        </button>
      </div>

      {loading && stories.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl gold-border p-4 space-y-3">
              <div className="h-40 bg-muted animate-pulse rounded-lg" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story, i) => {
            const isExpanded = expandedIdx === i;
            return (
              <div
                key={i}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                className="bg-card rounded-xl gold-border overflow-hidden card-hover cursor-pointer flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img src={story.image_url!} alt={story.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold uppercase bg-accent text-accent-foreground px-2 py-0.5 rounded">
                      {story.category}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-1">{story.title}</h3>
                  <p className={`text-xs text-muted-foreground ${isExpanded ? '' : 'line-clamp-2'} flex-1`}>{story.excerpt}</p>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {FACT_ICONS[story.fact_check_status] || FACT_ICONS.unverified}
                        <span className="capitalize">{story.fact_check_status?.replace('_', ' ')}</span>
                        <Clock size={12} className="ml-2" />
                        <span>{story.published_approx ? new Date(story.published_approx).toLocaleDateString() : 'Today'}</span>
                      </div>
                      <a href={story.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        Full article at {story.source} <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>{story.source}</span>
                    {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-card rounded-xl gold-border">
          <p className="text-muted-foreground text-sm">No personalized stories yet. Try refreshing.</p>
        </div>
      )}

      <div className="mt-2 text-center">
        <p className="text-[10px] text-muted-foreground italic">
          🤖 Personalized based on your interests: {interests.join(', ')}
        </p>
      </div>
    </section>
  );
}
