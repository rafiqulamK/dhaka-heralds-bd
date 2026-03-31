import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLocalInterests } from '@/components/OnboardingModal';
import ArticleCard from '@/components/ArticleCard';
import { RefreshCw, Loader2 } from 'lucide-react';

export default function ForYouFeed() {
  const [dbArticles, setDbArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [interests] = useState(() => getLocalInterests());

  useEffect(() => {
    const loadDb = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, categories(name, slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(6);
      setDbArticles(data || []);
      setLoading(false);
    };
    loadDb();
  }, []);

  if (dbArticles.length === 0 && !loading) return null;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-7 bg-accent rounded-full" />
        <h2 className="text-xl font-bold gradient-text">For You</h2>
        <span className="flex-1 h-px bg-border" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="h-40 bg-muted animate-pulse rounded-xl" />
              <div className="h-4 bg-muted animate-pulse rounded-lg w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded-lg w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dbArticles.map(a => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}

      {interests.length > 0 && (
        <div className="mt-3 text-center">
          <p className="text-[10px] text-muted-foreground italic">
            Based on your interests: {interests.join(', ')}
          </p>
        </div>
      )}
    </section>
  );
}
