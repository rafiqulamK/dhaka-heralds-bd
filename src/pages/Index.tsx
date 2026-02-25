import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ArticleCard from '@/components/ArticleCard';
import CategoryTabs from '@/components/CategoryTabs';
import HotList from '@/components/HotList';
import VideoCard from '@/components/VideoCard';
import TrendingNews from '@/components/TrendingNews';
import ForYouFeed from '@/components/ForYouFeed';
import OnboardingModal from '@/components/OnboardingModal';
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

function ArticleSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-card border border-border">
      <div className="h-52 bg-muted animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-muted animate-pulse rounded-full" />
        <div className="h-5 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
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
  const [, setInterests] = useState<string[]>([]);

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

  const featured = featuredArticles.slice(0, 4);
  const latest = latestArticles;
  const hasContent = featured.length > 0 || latest.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal onComplete={setInterests} />
      <Navbar />
      <CategoryTabs />

      {/* Breaking News Ticker */}
      <div className="bg-primary/10 border-b border-primary/20 py-2 overflow-hidden">
        <div className="flex items-center">
          <span className="shrink-0 bg-primary text-primary-foreground text-[11px] font-bold px-3 py-1 mx-4 flex items-center gap-1 uppercase tracking-wider rounded-full">
            <Zap size={11} /> Live
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
            {[...Array(6)].map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Full-bleed Hero */}
            {hasContent && (
              <section className="mb-10">
                {featured.length > 0 || latest.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    {/* Main hero */}
                    <div className="lg:col-span-8">
                      {(featured[0] || latest[0]) && (
                        <Link
                          to={`/article/${(featured[0] || latest[0]).slug}`}
                          className="block group relative overflow-hidden rounded-2xl gold-border card-hover"
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
                              <span className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest">
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

                    {/* Side cards + Hot List */}
                    <div className="lg:col-span-4 flex flex-col gap-4">
                      {(featured.length > 1 ? featured.slice(1, 3) : latest.slice(1, 3)).map(a => (
                        <ArticleCard key={a.id} article={a} variant="horizontal" />
                      ))}
                      <HotList articles={latest} />
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* For You — personalized */}
            <ForYouFeed />

            {/* Trending Now */}
            <TrendingNews />

            {/* Latest News */}
            {latest.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1 h-6 bg-primary rounded" />
                  <h2 className="text-xl font-bold gold-text">Latest News</h2>
                  <span className="flex-1 h-px bg-border" />
                  <Link to="/category/world" className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                    View All <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {latest.slice(0, 6).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Videos */}
            {(featuredVideos.length > 0 || latestVideos.length > 0) && (
              <section className="mb-12 bg-card rounded-2xl p-6 gold-border">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1 h-6 bg-primary rounded" />
                  <h2 className="text-xl font-bold gold-text flex items-center gap-2">
                    <Play size={18} className="text-primary" fill="currentColor" /> Videos
                  </h2>
                  <span className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(featuredVideos.length > 0 ? featuredVideos : latestVideos.slice(0, 3)).map(v => (
                    <VideoCard key={v.id} video={v} variant="featured" />
                  ))}
                </div>
                {latestVideos.length > 3 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {latestVideos.slice(3, 7).map(v => (
                      <VideoCard key={v.id} video={v} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* More Stories */}
            {latest.length > 6 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1 h-6 bg-primary rounded" />
                  <h2 className="text-xl font-bold gold-text">More Stories</h2>
                  <span className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {latest.slice(6, 10).map(a => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {!hasContent && (
              <div className="text-center py-20">
                <img src={logo} alt="Dhaka Heralds" className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30 mx-auto mb-6" />
                <h2 className="text-2xl font-bold gold-text mb-2">Welcome to Dhaka Heralds</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  No published articles yet. Check the AI-curated sections above for the latest news.
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
