import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import VideoCard from '@/components/VideoCard';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: cat } = await supabase.from('categories').select('*').eq('slug', slug!).single();
      setCategory(cat);
      if (cat) {
        const [arts, vids] = await Promise.all([
          supabase.from('articles').select('*, categories(name, slug)').eq('category_id', cat.id).eq('status', 'published').order('published_at', { ascending: false }).limit(20),
          supabase.from('videos').select('*, categories(name)').eq('category_id', cat.id).eq('status', 'published').order('published_at', { ascending: false }).limit(12),
        ]);
        setArticles(arts.data || []);
        setVideos(vids.data || []);
      }
      setLoading(false);
    };
    load();
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="mb-8 pb-6 border-b border-border">
          <h1 className="text-3xl font-bold gold-text capitalize">{category?.name || slug}</h1>
          {category?.description && <p className="text-muted-foreground mt-2">{category.description}</p>}
        </div>
        {articles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}
        {videos.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          </section>
        )}
        {!loading && articles.length === 0 && videos.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No content in this category yet.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
