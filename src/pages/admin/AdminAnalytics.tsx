import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Eye, MousePointerClick, TrendingUp, FileText, Video, Share2, Megaphone, Loader2 } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

interface Stats {
  totalArticles: number;
  totalViews: number;
  totalAds: number;
  activeAds: number;
  totalClicks: number;
  totalImpressions: number;
  totalSocialPosts: number;
  totalVideos: number;
  topArticles: { title: string; views: number }[];
  adPerformance: { title: string; clicks: number; impressions: number }[];
  categoryBreakdown: { name: string; count: number }[];
  platformBreakdown: { platform: string; count: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--destructive))', '#f59e0b', '#8b5cf6', '#06b6d4'];

const chartConfig: ChartConfig = {
  views: { label: 'Views', color: 'hsl(var(--primary))' },
  clicks: { label: 'Clicks', color: 'hsl(var(--accent))' },
  impressions: { label: 'Impressions', color: 'hsl(var(--muted-foreground))' },
  count: { label: 'Articles', color: 'hsl(var(--primary))' },
};

export default function AdminAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [articles, ads, socialPosts, videos, categories] = await Promise.all([
        supabase.from('articles').select('id, title, view_count, category_id, categories(name)').order('view_count', { ascending: false }).limit(50),
        supabase.from('advertisements').select('*'),
        supabase.from('social_posts').select('id, platform'),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id, name'),
      ]);

      const articleData = articles.data || [];
      const adData = ads.data || [];
      const socialData = socialPosts.data || [];
      const catMap = new Map<string, number>();

      articleData.forEach((a: any) => {
        const catName = a.categories?.name || 'Uncategorized';
        catMap.set(catName, (catMap.get(catName) || 0) + 1);
      });

      const platformMap = new Map<string, number>();
      socialData.forEach((s: any) => {
        platformMap.set(s.platform, (platformMap.get(s.platform) || 0) + 1);
      });

      setStats({
        totalArticles: articleData.length,
        totalViews: articleData.reduce((sum: number, a: any) => sum + (a.view_count || 0), 0),
        totalAds: adData.length,
        activeAds: adData.filter((a: any) => a.is_active).length,
        totalClicks: adData.reduce((sum: number, a: any) => sum + (a.click_count || 0), 0),
        totalImpressions: adData.reduce((sum: number, a: any) => sum + (a.impression_count || 0), 0),
        totalSocialPosts: socialData.length,
        totalVideos: videos.count || 0,
        topArticles: articleData.slice(0, 10).map((a: any) => ({ title: a.title?.substring(0, 30) + '...', views: a.view_count || 0 })),
        adPerformance: adData.map((a: any) => ({ title: a.title?.substring(0, 20) + '...', clicks: a.click_count || 0, impressions: a.impression_count || 0 })),
        categoryBreakdown: Array.from(catMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
        platformBreakdown: Array.from(platformMap.entries()).map(([platform, count]) => ({ platform, count })),
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const summaryCards = [
    { icon: FileText, label: 'Total Articles', value: stats.totalArticles, color: 'text-primary' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews.toLocaleString(), color: 'text-accent' },
    { icon: Megaphone, label: 'Active Ads', value: `${stats.activeAds}/${stats.totalAds}`, color: 'text-destructive' },
    { icon: MousePointerClick, label: 'Ad Clicks', value: stats.totalClicks.toLocaleString(), color: 'text-primary' },
    { icon: Share2, label: 'Social Posts', value: stats.totalSocialPosts, color: 'text-accent' },
    { icon: Video, label: 'Videos', value: stats.totalVideos, color: 'text-primary' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 size={24} className="text-primary" /> Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Content performance & ad metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {summaryCards.map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} className={color} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Articles by Views */}
        {stats.topArticles.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" /> Top Articles by Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={stats.topArticles} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="title" width={120} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Ad Performance */}
        {stats.adPerformance.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Megaphone size={14} className="text-primary" /> Ad Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={stats.adPerformance} margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="title" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="impressions" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Breakdown */}
        {stats.categoryBreakdown.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <BarChart3 size={14} className="text-primary" /> Articles by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  <Pie
                    data={stats.categoryBreakdown}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, count }) => `${name}: ${count}`}
                    labelLine={false}
                  >
                    {stats.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Social Platform Breakdown */}
        {stats.platformBreakdown.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Share2 size={14} className="text-primary" /> Posts by Platform
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <BarChart data={stats.platformBreakdown} margin={{ left: 10, right: 20 }}>
                  <XAxis dataKey="platform" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Ad Details Table */}
      {stats.adPerformance.length > 0 && (
        <Card className="border-border mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Ad Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 px-3 font-medium">Ad</th>
                    <th className="text-right py-2 px-3 font-medium">Impressions</th>
                    <th className="text-right py-2 px-3 font-medium">Clicks</th>
                    <th className="text-right py-2 px-3 font-medium">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.adPerformance.map((ad, i) => {
                    const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-2 px-3 text-foreground">{ad.title}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">{ad.impressions.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-primary font-medium">{ad.clicks.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-accent font-medium">{ctr}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </AdminLayout>
  );
}
