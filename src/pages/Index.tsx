import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import VideoCard from '@/components/VideoCard';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Zap } from 'lucide-react';
import logo from '@/assets/dhaka-heralds-logo.jpg';

const BREAKING_NEWS = [
  'Bangladesh marks historic diplomatic milestone in South Asia — February 2026',
  'Dhaka Heralds exclusive: New climate resilience initiative launched for coastal regions',
  'Economic summit draws global leaders to Dhaka ahead of G20 discussions',
  'Cultural heritage sites of Bangladesh receive renewed UNESCO recognition in 2026',
  'Bangladesh tech sector surges with record $2B in exports',
];

function LogoSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <img
        src={logo}
        alt="Loading..."
        className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/50 animate-pulse"
      />
      <div className="text-sm text-muted-foreground animate-pulse">Loading latest stories...</div>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        <div className="h-5 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card border border-border">
      <div className="aspect-video bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}

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

  const demoArticles = [
    { id: '1', title: 'Bangladesh at 55: A Nation Forging Its Path in the Global Arena', slug: 'bangladesh-at-55', excerpt: 'As Bangladesh commemorates another year of independence in 2026, the nation stands at a crossroads of unprecedented economic growth and democratic challenges.', cover_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', published_at: new Date().toISOString(), view_count: 12400, featured: true, categories: { name: 'Bangladesh', slug: 'bangladesh' } },
    { id: '2', title: 'The Padma Bridge: Three Years of Transforming Southern Bangladesh', slug: 'padma-bridge-2026', excerpt: 'Three years since its inauguration, the Padma Bridge has fundamentally reshaped the economic geography of southern Bangladesh.', cover_image_url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80', published_at: new Date(Date.now() - 3600000).toISOString(), view_count: 8700, featured: true, categories: { name: 'Business', slug: 'business' } },
    { id: '3', title: 'Climate Resilience 2026: Bangladesh Leads Global South Adaptation Efforts', slug: 'climate-resilience-2026', excerpt: 'Bangladesh emerges as a global leader in climate adaptation strategies as coastal communities implement innovative resilience programs.', cover_image_url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', published_at: new Date(Date.now() - 7200000).toISOString(), view_count: 6200, featured: true, categories: { name: 'World', slug: 'world' } },
    { id: '4', title: 'RMG Sector 2026: Bangladesh Garment Industry Embraces Sustainable Practices', slug: 'rmg-sector-2026', excerpt: 'The backbone of Bangladesh\'s economy continues to evolve with sustainable manufacturing and fair wage initiatives gaining momentum.', cover_image_url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80', published_at: new Date(Date.now() - 10800000).toISOString(), view_count: 4300, featured: false, categories: { name: 'Business', slug: 'business' } },
    { id: '5', title: 'Digital Bangladesh 2026: Tech Exports Cross $2 Billion Milestone', slug: 'digital-bangladesh-2026', excerpt: 'Bangladesh\'s technology sector reaches a historic milestone with IT exports surpassing $2 billion, driven by AI and fintech innovation.', cover_image_url: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80', published_at: new Date(Date.now() - 14400000).toISOString(), view_count: 9800, featured: false, categories: { name: 'Business', slug: 'business' } },
    { id: '6', title: 'Sundarbans Conservation 2026: New Mangrove Restoration Project Launched', slug: 'sundarbans-2026', excerpt: 'A landmark international conservation project aims to restore 500 hectares of mangrove forest in the Sundarbans.', cover_image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', published_at: new Date(Date.now() - 18000000).toISOString(), view_count: 5100, featured: false, categories: { name: 'Culture', slug: 'culture' } },
  ];

  const demoVideos = [
    { id: '1', title: 'Liberation 1971: Untold Stories from the Frontlines', slug: 'liberation-1971', description: 'A comprehensive documentary exploring firsthand accounts from freedom fighters of the 1971 Liberation War.', thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80', duration_seconds: 5640, view_count: 45000, featured: true, categories: { name: 'Documentaries' } },
    { id: '2', title: 'Dhaka 2026: The Megacity Reinventing Itself', slug: 'dhaka-2026', description: 'How Dhaka — one of the world\'s most densely populated cities — is transforming through metro rail, smart city initiatives, and green spaces.', thumbnail_url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80', duration_seconds: 3420, view_count: 28000, featured: true, categories: { name: 'Documentaries' } },
    { id: '3', title: 'Rana Plaza: Justice and Reform — A Decade Later', slug: 'rana-plaza-decade', description: 'More than a decade after the deadliest garment factory disaster, survivors speak about justice, healing, and lasting industry reform.', thumbnail_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80', duration_seconds: 4200, view_count: 31000, featured: true, categories: { name: 'World' } },
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
        {loading ? (
          <>
            <LogoSkeleton />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
            </div>
          </>
        ) : (
          <>
            {/* Hero Section */}
            <section className="mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-auto lg:h-[500px]">
                <div className="lg:col-span-2">
                  {articles[0] && <ArticleCard article={articles[0]} variant="featured" />}
                </div>
                <div className="flex flex-col gap-4">
                  {articles.slice(1, 3).map(a => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" />
                  ))}
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

            {/* Latest News */}
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

            {/* Videos */}
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

            {/* More Stories */}
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
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
