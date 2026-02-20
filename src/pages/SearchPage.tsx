import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import VideoCard from '@/components/VideoCard';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    const search = async () => {
      setLoading(true);
      const [arts, vids] = await Promise.all([
        supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').ilike('title', `%${query}%`).limit(12),
        supabase.from('videos').select('*, categories(name)').eq('status', 'published').ilike('title', `%${query}%`).limit(8),
      ]);
      setArticles(arts.data || []);
      setVideos(vids.data || []);
      setLoading(false);
    };
    search();
  }, [query]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Search size={24} className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Search results for "<span className="gold-text">{query}</span>"</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {articles.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Articles ({articles.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {articles.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              </section>
            )}
            {videos.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Videos ({videos.length})</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {videos.map(v => <VideoCard key={v.id} video={v} />)}
                </div>
              </section>
            )}
            {articles.length === 0 && videos.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">No results found for "{query}"</p>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
