import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import VideoCard from '@/components/VideoCard';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Zap } from 'lucide-react';

const BREAKING_NEWS = [
  'Bangladesh marks historic diplomatic milestone in South Asia',
  'Dhaka Heralds exclusive: Documentary on the Liberation War premieres next week',
  'Economic summit draws global leaders to Dhaka',
  'Cultural heritage sites of Bangladesh receive UNESCO recognition',
];

export default function Index() {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([]);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [fa, la, fv, lv] = await Promise.all([
        supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').eq('featured', true).order('published_at', { ascending: false }).limit(4),
        supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(12),
        supabase.from('videos').select('*, categories(name, slug)').eq('status', 'published').eq('featured', true).order('published_at', { ascending: false }).limit(3),
        supabase.from('videos').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(8),
      ]);
      setFeaturedArticles(fa.data || []);
      setLatestArticles(la.data || []);
      setFeaturedVideos(fv.data || []);
      setLatestVideos(lv.data || []);
      setLoading(false);
    };
    load();
  }, []);

  // Demo content when DB is empty
  const demoArticles = [
    { id: '1', title: 'Bangladesh at 54: A Nation Forging Its Path in the Global Arena', slug: 'bangladesh-at-54', excerpt: 'As Bangladesh commemorates another year of independence, the nation stands at a crossroads of unprecedented economic growth and democratic challenges.', cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', published_at: new Date().toISOString(), view_count: 12400, featured: true, categories: { name: 'Bangladesh', slug: 'bangladesh' } },
    { id: '2', title: 'The Padma Bridge: Engineering Marvel Transforms Lives Across River Delta', slug: 'padma-bridge', excerpt: 'Two years since its inauguration, the Padma Bridge has fundamentally changed the economic geography of southern Bangladesh.', cover_image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80', published_at: new Date(Date.now() - 3600000).toISOString(), view_count: 8700, featured: true, categories: { name: 'Business', slug: 'business' } },
    { id: '3', title: 'Climate Refugees: Dhaka Swells as Coastal Villages Disappear Beneath Rising Tides', slug: 'climate-refugees', excerpt: 'An in-depth investigation into the migration crisis unfolding as sea levels erode Bangladesh coastal communities.', cover_image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', published_at: new Date(Date.now() - 7200000).toISOString(), view_count: 6200, featured: true, categories: { name: 'World', slug: 'world' } },
    { id: '4', title: 'RMG Sector Evolution: Bangladesh Garment Workers Fighting for Fair Wages', slug: 'rmg-sector', excerpt: 'The backbone of Bangladesh economy continues to evolve as workers demand better conditions and global brands face scrutiny.', cover_image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', published_at: new Date(Date.now() - 10800000).toISOString(), view_count: 4300, featured: false, categories: { name: 'Business', slug: 'business' } },
    { id: '5', title: 'Political Landscape Shifts as Opposition Mobilizes Ahead of Elections', slug: 'political-landscape', excerpt: 'Bangladesh political arena enters a critical phase with multiple parties repositioning ahead of the upcoming national elections.', cover_image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80', published_at: new Date(Date.now() - 14400000).toISOString(), view_count: 9800, featured: false, categories: { name: 'Politics', slug: 'politics' } },
    { id: '6', title: 'Sundarbans Under Threat: Mangroves Losing Battle Against Industrial Expansion', slug: 'sundarbans', excerpt: 'The world largest mangrove forest faces existential pressure from development projects and climate change.', cover_image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', published_at: new Date(Date.now() - 18000000).toISOString(), view_count: 5100, featured: false, categories: { name: 'Culture', slug: 'culture' } },
  ];

  const demoVideos = [
    { id: '1', title: 'Liberation 1971: Untold Stories from the Frontlines', slug: 'liberation-1971', description: 'A comprehensive documentary exploring firsthand accounts from freedom fighters of the 1971 Liberation War.', thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', duration_seconds: 5640, view_count: 45000, featured: true, categories: { name: 'Documentaries' } },
    { id: '2', title: 'Dhaka: The Megacity That Never Sleeps', slug: 'dhaka-megacity', description: 'Inside Dhaka — one of the world most densely populated cities — and the lives of its 22 million inhabitants.', thumbnail_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', duration_seconds: 3420, view_count: 28000, featured: true, categories: { name: 'Documentaries' } },
    { id: '3', title: 'Rana Plaza: A Decade of Justice Denied', slug: 'rana-plaza', description: 'Ten years after the deadliest garment factory disaster, survivors speak about justice, healing, and industry reform.', thumbnail_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', duration_seconds: 4200, view_count: 31000, featured: true, categories: { name: 'World' } },
  ];

  const articles = featuredArticles.length > 0 ? featuredArticles : demoArticles.filter(a => a.featured);
  const allLatest = latestArticles.length > 0 ? latestArticles : demoArticles;
  const videos = featuredVideos.length > 0 ? featuredVideos : demoVideos;
  const allVideos = latestVideos.length > 0 ? latestVideos : demoVideos;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Breaking News Ticker */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 overflow-hidden">
        <div className="flex items-center">
          <span className="shrink-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 mx-4 flex items-center gap-1 uppercase tracking-wider rounded">
            <Zap size={12} /> Breaking
          </span>
          <div className="overflow-hidden flex-1">
            <div className="breaking-ticker whitespace-nowrap text-sm text-foreground/80">
              {BREAKING_NEWS.join('  •  ')}  •  {BREAKING_NEWS.join('  •  ')}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[500px]">
            {/* Main featured */}
            <div className="lg:col-span-2">
              {articles[0] && <ArticleCard article={articles[0]} variant="featured" />}
            </div>
            {/* Side featured */}
            <div className="flex flex-col gap-4">
              {articles.slice(1, 3).map(a => (
                <ArticleCard key={a.id} article={a} variant="horizontal" />
              ))}
              {/* Latest mini list */}
              <div className="bg-card rounded-lg gold-border p-4 flex-1">
                <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-primary inline-block" />
                  Latest Updates
                </h3>
                {allLatest.slice(0, 5).map(a => (
                  <ArticleCard key={a.id} article={a} variant="compact" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-primary rounded" />
            <h2 className="text-xl font-bold gold-text">Latest News</h2>
            <span className="flex-1 h-px bg-border" />
            <Link to="/category/world" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allLatest.slice(0, 6).map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>

        {/* Documentary / Video Section */}
        <section className="mb-12 bg-card rounded-xl p-6 gold-border">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-primary rounded" />
            <h2 className="text-xl font-bold gold-text flex items-center gap-2">
              <Play size={18} className="text-primary" fill="currentColor" /> Documentaries & Videos
            </h2>
            <span className="flex-1 h-px bg-border" />
            <Link to="/category/documentaries" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {videos.map(v => (
              <VideoCard key={v.id} video={v} variant="featured" />
            ))}
          </div>
          {allVideos.length > 3 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {allVideos.slice(3, 7).map(v => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </section>

        {/* More Articles Grid */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-6 bg-primary rounded" />
            <h2 className="text-xl font-bold gold-text">More Stories</h2>
            <span className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allLatest.slice(6, 10).map(a => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
