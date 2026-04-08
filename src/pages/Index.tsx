import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import CategoryTabs from '@/components/CategoryTabs';
import HotList from '@/components/HotList';
import VideoCard from '@/components/VideoCard';
import ForYouFeed from '@/components/ForYouFeed';
import OnboardingModal from '@/components/OnboardingModal';
import AutoSliderCarousel from '@/components/AutoSliderCarousel';
import SocialPostsSection from '@/components/SocialPostsSection';
import AdBanner from '@/components/AdBanner';
import { Link } from 'react-router-dom';
import { Play, ChevronRight, Zap, Newspaper, Globe, TrendingUp } from 'lucide-react';
import logo from '@/assets/dhaka-heralds-logo.jpg';

const BREAKING_NEWS = [
  'Bangladesh marks historic diplomatic milestone in South Asia — March 2026',
  'Dhaka Heralds exclusive: New climate resilience initiative launched for coastal regions',
  'Economic summit draws global leaders to Dhaka ahead of G20 discussions',
  'Cultural heritage sites of Bangladesh receive renewed UNESCO recognition in 2026',
  'Bangladesh tech sector surges with record $2B in exports',
];

function ArticleSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 bg-muted animate-pulse rounded-full" />
        <div className="h-5 w-full bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, link, linkText = 'View All', gradient = false }: { icon?: any; title: string; link?: string; linkText?: string; gradient?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-1 h-7 bg-primary rounded-full" />
      <h2 className={`text-xl font-bold flex items-center gap-2 ${gradient ? 'gradient-text' : 'text-foreground'}`}>
        {Icon && <Icon size={20} className="text-primary" />}
        {title}
      </h2>
      <span className="flex-1 h-px bg-border" />
      {link && (
        <Link to={link} className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
          {linkText} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default function Index() {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [latestArticles, setLatestArticles] = useState<any[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([]);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setInterests] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    const [fa, la, fv, lv] = await Promise.all([
      supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').eq('featured', true).order('published_at', { ascending: false }).limit(10),
      supabase.from('articles').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(100),
      supabase.from('videos').select('*, categories(name, slug)').eq('status', 'published').eq('featured', true).order('published_at', { ascending: false }).limit(6),
      supabase.from('videos').select('*, categories(name, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(20),
    ]);
    setFeaturedArticles(fa.data || []);
    setLatestArticles(la.data || []);
    setFeaturedVideos(fv.data || []);
    setLatestVideos(lv.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  const featured = featuredArticles.slice(0, 4);
  const latest = latestArticles;
  const hasContent = featured.length > 0 || latest.length > 0;

  const ownPosts = latest.filter(a => a.tags?.includes('dhaka-heralds-fb') || a.tags?.includes('dhaka heralds'));
  const worldNews = latest.filter(a => a.categories?.slug === 'world' || a.categories?.name?.toLowerCase() === 'world');
  const bdNews = latest.filter(a => a.categories?.slug === 'bangladesh' || a.categories?.name?.toLowerCase() === 'bangladesh');

  const allVideos = featuredVideos.length > 0 ? featuredVideos : latestVideos.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal onComplete={setInterests} />
      <Navbar />
      <CategoryTabs />

      {/* Breaking News Ticker */}
      <div className="gradient-bg border-b border-border/50 py-2.5 overflow-hidden">
        <div className="flex items-center">
          <span className="shrink-0 bg-primary text-primary-foreground text-[11px] font-bold px-3.5 py-1 mx-4 flex items-center gap-1.5 uppercase tracking-wider rounded-lg">
            <Zap size={11} /> Live
          </span>
          <div className="overflow-hidden flex-1">
            <div className="breaking-ticker whitespace-nowrap text-sm text-foreground/80 font-medium">
              {BREAKING_NEWS.join('  •  ')}  •  {BREAKING_NEWS.join('  •  ')}
            </div>
          </div>
        </div>
      </div>

      {/* Header Ad Banner */}
      <AdBanner placement="header-banner" className="max-w-7xl mx-auto px-4 md:px-8 mt-6" />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Hero */}
            {hasContent && (
              <section className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    {(featured[0] || latest[0]) && (
                      <Link
                        to={`/article/${(featured[0] || latest[0]).slug}`}
                        className="block group relative overflow-hidden rounded-2xl border border-border card-hover"
                      >
                        <div className="aspect-[16/9] overflow-hidden">
                          <img
                            src={(featured[0] || latest[0]).cover_image_url || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80'}
                            alt={(featured[0] || latest[0]).title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                          {(featured[0] || latest[0]).categories && (
                            <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-lg mb-3 uppercase tracking-widest">
                              {(featured[0] || latest[0]).categories.name}
                            </span>
                          )}
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
                            {(featured[0] || latest[0]).title}
                          </h2>
                          {(featured[0] || latest[0]).excerpt && (
                            <p className="text-muted-foreground text-sm md:text-base line-clamp-2 max-w-2xl">
                              {(featured[0] || latest[0]).excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    )}
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    {(featured.length > 1 ? featured.slice(1, 3) : latest.slice(1, 3)).map(a => (
                      <ArticleCard key={a.id} article={a} variant="horizontal" />
                    ))}
                    <HotList articles={latest} />
                  </div>
                </div>
              </section>
            )}

            {/* Dhaka Heralds Own Posts */}
            {ownPosts.length > 0 && (
              <section className="mb-12">
                <SectionHeader icon={Newspaper} title="Dhaka Heralds Posts" />
                <AutoSliderCarousel articles={ownPosts} />
              </section>
            )}

            {/* Latest News Slider */}
            {latest.length > 0 && (
              <section className="mb-12">
                <SectionHeader icon={TrendingUp} title="Latest News" link="/category/world" />
                <AutoSliderCarousel articles={latest} />
              </section>
            )}

            {/* For You */}
            <ForYouFeed />

            {/* In-feed Ad */}
            <AdBanner placement="in-feed" className="mb-12" />

            {/* Social Feed */}
            <SocialPostsSection />

            {/* World News */}
            {worldNews.length > 0 && (
              <section className="mb-12">
                <SectionHeader icon={Globe} title="World News" link="/category/world" linkText="More" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {worldNews.slice(0, 8).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Bangladesh News */}
            {bdNews.length > 0 && (
              <section className="mb-12">
                <SectionHeader title="🇧🇩 Bangladesh" link="/category/bangladesh" linkText="More" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {bdNews.slice(0, 8).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Between-sections Ad */}
            <AdBanner placement="between-sections" className="mb-12" />

            {/* Videos */}
            {allVideos.length > 0 && (
              <section className="mb-14 bg-card rounded-2xl p-6 md:p-8 border border-border">
                <SectionHeader icon={Play} title="Videos" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {allVideos.slice(0, 3).map(v => (
                    <VideoCard key={v.id} video={v} variant="embed" />
                  ))}
                </div>
                {latestVideos.length > 3 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
                    {latestVideos.slice(3, 7).map(v => (
                      <VideoCard key={v.id} video={v} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* More Stories */}
            {latest.length > 8 && (
              <section className="mb-14">
                <SectionHeader title="More Stories" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {latest.slice(8, 20).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Article bottom Ad */}
            <AdBanner placement="article-bottom" className="mb-12" />

            {/* Empty state */}
            {!hasContent && (
              <div className="text-center py-24">
                <img src={logo} alt="Dhaka Heralds" className="h-24 w-24 rounded-2xl object-cover ring-2 ring-border mx-auto mb-6" />
                <h2 className="text-2xl font-bold gradient-text mb-2">Welcome to Dhaka Heralds</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No published articles yet. Check back soon for the latest news.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
