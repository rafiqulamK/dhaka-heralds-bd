import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import CategoryTabs from '@/components/CategoryTabs';
import Footer from '@/components/Footer';
import EngagementSidebar from '@/components/EngagementSidebar';
import ArticleCard from '@/components/ArticleCard';
import { Clock, Eye, Tag, ChevronRight } from 'lucide-react';

const DEMO_ARTICLES: Record<string, any> = {
  'bangladesh-at-55': { title: 'Bangladesh at 55: A Nation Forging Its Path in the Global Arena', excerpt: 'As Bangladesh commemorates another year of independence in 2026, the nation stands at a crossroads of unprecedented economic growth and democratic challenges.', content: 'As Bangladesh commemorates another year of independence in 2026, the nation stands at a crossroads of unprecedented economic growth and democratic challenges.\n\nThe country has made remarkable strides in economic development, with GDP growth consistently above 6% and significant improvements in social indicators. The garment industry continues to be the backbone of exports, while the technology sector has emerged as a new growth engine.\n\nHowever, challenges remain in governance, climate adaptation, and ensuring equitable development across all regions. The Padma Bridge, completed in 2022, has transformed connectivity in southern Bangladesh, opening new economic corridors.\n\nAs the nation looks ahead, the balance between rapid modernization and preserving cultural heritage will define Bangladesh\'s trajectory on the world stage.', cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', published_at: new Date().toISOString(), view_count: 12400, categories: { name: 'Bangladesh', slug: 'bangladesh' }, tags: ['Bangladesh', 'Independence', 'Economy'] },
  'padma-bridge-2026': { title: 'The Padma Bridge: Three Years of Transforming Southern Bangladesh', excerpt: 'Three years since its inauguration, the Padma Bridge has fundamentally reshaped the economic geography of southern Bangladesh.', content: 'Three years since its inauguration, the Padma Bridge has fundamentally reshaped the economic geography of southern Bangladesh.\n\nThe 6.15-kilometer bridge spanning the Padma River has reduced travel time between Dhaka and the southwestern districts from 8 hours to just 2 hours. This has catalyzed industrial growth, improved healthcare access, and boosted agricultural trade.\n\nEconomic studies show that GDP growth in the southern districts has accelerated by 1.5-2% annually since the bridge opened. New industrial zones have emerged in Mongla and Payra, while tourism to the Sundarbans has increased significantly.', cover_image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80', published_at: new Date(Date.now() - 3600000).toISOString(), view_count: 8700, categories: { name: 'Business', slug: 'business' }, tags: ['Infrastructure', 'Economy', 'Development'] },
  'climate-resilience-2026': { title: 'Climate Resilience 2026: Bangladesh Leads Global South Adaptation Efforts', excerpt: 'Bangladesh emerges as a global leader in climate adaptation strategies.', content: 'Bangladesh emerges as a global leader in climate adaptation strategies as coastal communities implement innovative resilience programs.\n\nThe country\'s experience with cyclones, floods, and rising sea levels has made it a pioneer in disaster preparedness and climate adaptation. The Bangladesh Delta Plan 2100 continues to guide long-term climate resilience investments.\n\nInnovative solutions including floating gardens, cyclone-resistant housing, and early warning systems have been adopted by other vulnerable nations. International climate finance has increasingly recognized Bangladesh\'s leadership role.', cover_image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', published_at: new Date(Date.now() - 7200000).toISOString(), view_count: 6200, categories: { name: 'World', slug: 'world' }, tags: ['Climate', 'Environment', 'Adaptation'] },
  'rmg-sector-2026': { title: 'RMG Sector 2026: Bangladesh Garment Industry Embraces Sustainable Practices', excerpt: 'The backbone of Bangladesh\'s economy continues to evolve with sustainable manufacturing.', content: 'The ready-made garment sector, which accounts for over 80% of Bangladesh\'s export earnings, is undergoing a green transformation.\n\nMajor factories have adopted solar energy, water recycling, and sustainable material sourcing. LEED-certified green factories in Bangladesh now number over 200, the highest in the world for the garment industry.', cover_image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', published_at: new Date(Date.now() - 10800000).toISOString(), view_count: 4300, categories: { name: 'Business', slug: 'business' }, tags: ['RMG', 'Sustainability'] },
  'digital-bangladesh-2026': { title: 'Digital Bangladesh 2026: Tech Exports Cross $2 Billion Milestone', excerpt: 'Bangladesh\'s technology sector reaches a historic milestone.', content: 'Bangladesh\'s IT exports have surpassed $2 billion in 2026, driven by growth in AI services, fintech solutions, and software development outsourcing.\n\nThe government\'s Digital Bangladesh initiative, combined with a young, tech-savvy workforce, has positioned the country as an emerging technology hub in South Asia.', cover_image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80', published_at: new Date(Date.now() - 14400000).toISOString(), view_count: 9800, categories: { name: 'Business', slug: 'business' }, tags: ['Technology', 'Exports', 'AI'] },
  'sundarbans-2026': { title: 'Sundarbans Conservation 2026: New Mangrove Restoration Project Launched', excerpt: 'A landmark international conservation project aims to restore 500 hectares of mangrove forest.', content: 'A landmark international conservation project has been launched to restore 500 hectares of mangrove forest in the Sundarbans, the world\'s largest mangrove ecosystem.\n\nThe project, funded by international climate organizations and the Bangladesh government, aims to combat coastal erosion and protect biodiversity including the endangered Bengal tiger.', cover_image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', published_at: new Date(Date.now() - 18000000).toISOString(), view_count: 5100, categories: { name: 'Culture', slug: 'culture' }, tags: ['Conservation', 'Sundarbans', 'Environment'] },
};

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      // Check demo articles first
      if (slug && DEMO_ARTICLES[slug]) {
        setArticle(DEMO_ARTICLES[slug]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('articles')
        .select('*, categories(name, slug)')
        .eq('slug', slug!)
        .single();
      setArticle(data);
      setLoading(false);
      if (data) {
        supabase.from('articles').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
        // Fetch related articles
        if (data.category_id) {
          const { data: related } = await supabase
            .from('articles')
            .select('*, categories(name, slug)')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(4);
          setRelatedArticles(related || []);
        }
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
      <CategoryTabs />
      <EngagementSidebar articleTitle={article.title} />
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
          <div className="prose dark:prose-invert max-w-none text-foreground/90 leading-relaxed whitespace-pre-line">
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

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-1 h-6 bg-primary rounded" />
              <h2 className="text-xl font-bold gold-text">Related Stories</h2>
              <span className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedArticles.map(a => (
                <ArticleCard key={a.id} article={a} variant="horizontal" />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
