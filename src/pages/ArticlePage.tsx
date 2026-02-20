import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Clock, Eye, Tag } from 'lucide-react';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, categories(name, slug)')
        .eq('slug', slug!)
        .single();
      setArticle(data);
      setLoading(false);
      if (data) {
        supabase.from('articles').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
      }
    };
    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold gold-text">Article not found</h1>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-10">
        {article.categories && (
          <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wider">
            {article.categories.name}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">{article.title}</h1>
        {article.excerpt && (
          <p className="text-xl text-muted-foreground leading-relaxed mb-6 border-l-4 border-primary pl-4">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
          {article.published_at && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
          {article.view_count != null && (
            <span className="flex items-center gap-1.5"><Eye size={14} />{article.view_count.toLocaleString()} views</span>
          )}
        </div>
        {article.cover_image_url && (
          <img src={article.cover_image_url} alt={article.title} className="w-full rounded-lg object-cover max-h-96 mb-8 gold-border" />
        )}
        {article.content ? (
          <div className="prose prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
            {article.content}
          </div>
        ) : (
          <p className="text-muted-foreground italic">Full article content coming soon.</p>
        )}
        {article.tags?.length > 0 && (
          <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
            <Tag size={14} className="text-muted-foreground mt-0.5" />
            {article.tags.map((tag: string) => (
              <span key={tag} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">{tag}</span>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
