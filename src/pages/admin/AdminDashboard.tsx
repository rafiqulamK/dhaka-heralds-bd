import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { FileText, Video, Image, Tag, TrendingUp, Clock, ArrowUpRight, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, videos: 0, media: 0, categories: 0 });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const [a, v, m, c, recent] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('media').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('articles').select('id, title, status, published_at, cover_image_url, categories(name)').order('created_at', { ascending: false }).limit(8),
      ]);
      setStats({ articles: a.count || 0, videos: v.count || 0, media: m.count || 0, categories: c.count || 0 });
      setRecentArticles(recent.data || []);
    };
    load();
  }, []);

  const triggerSync = async (source?: string) => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('sync-fb-news', {
        body: source ? { source } : {},
      });
      if (error) throw error;
      setSyncResult(data);
      // Reload articles
      const recent = await supabase.from('articles').select('id, title, status, published_at, cover_image_url, categories(name)').order('created_at', { ascending: false }).limit(8);
      setRecentArticles(recent.data || []);
      const countRes = await supabase.from('articles').select('id', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, articles: countRes.count || 0 }));
    } catch (e) {
      setSyncResult({ success: false, error: String(e) });
    } finally {
      setSyncing(false);
    }
  };

  const cards = [
    { icon: FileText, label: 'Articles', value: stats.articles, href: '/admin/articles' },
    { icon: Video, label: 'Videos', value: stats.videos, href: '/admin/videos' },
    { icon: Image, label: 'Media', value: stats.media, href: '/admin/media' },
    { icon: Tag, label: 'Categories', value: stats.categories, href: '/admin/categories' },
  ];

  const syncSources = [
    { label: 'All Sources', value: undefined },
    { label: 'Dhaka Heralds FB', value: 'dhaka heralds' },
    { label: 'BBC News', value: 'bbc' },
    { label: 'Reuters', value: 'reuters' },
    { label: 'Al Jazeera', value: 'al jazeera' },
    { label: 'Dhaka Tribune', value: 'dhaka tribune' },
    { label: 'Daily Star BD', value: 'daily star' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your content &amp; news sync</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {cards.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} to={href} className="bg-card rounded-2xl border border-border p-5 card-hover group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-primary" />
              </div>
              <ArrowUpRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* News Sync Control */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-primary" /> News Sync
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Auto-syncs every 30 min from FB, BBC, Reuters, Al Jazeera, and more. Click to sync now.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {syncSources.map(s => (
              <button
                key={s.label}
                onClick={() => triggerSync(s.value)}
                disabled={syncing}
                className="text-xs px-3 py-2 rounded-xl border border-border bg-muted hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {syncing ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                {s.label}
              </button>
            ))}
          </div>
          {syncResult && (
            <div className={`text-xs p-3 rounded-xl border ${syncResult.success ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-destructive/10 border-destructive/30 text-destructive'}`}>
              {syncResult.success ? (
                <div className="flex items-start gap-2">
                  <CheckCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{syncResult.synced} articles synced</p>
                    <p className="text-muted-foreground mt-1">Found {syncResult.total_found} results, curated {syncResult.curated}</p>
                    {syncResult.sources_checked && (
                      <p className="text-muted-foreground">Sources: {syncResult.sources_checked.join(', ')}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{syncResult.error || 'Sync failed'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" /> Quick Actions
          </h2>
          <div className="space-y-2">
            <Link to="/admin/articles" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              <FileText size={16} /> Create New Article
            </Link>
            <Link to="/admin/videos" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              <Video size={16} /> Upload Video
            </Link>
            <Link to="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
              <Tag size={16} /> Manage Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-card rounded-2xl border border-border p-6 mt-4">
        <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock size={16} className="text-primary" /> Recent Articles
        </h2>
        <div className="space-y-1">
          {recentArticles.map(a => (
            <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors">
              {a.cover_image_url && (
                <img src={a.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {a.categories?.name && <span className="text-primary mr-2">{a.categories.name}</span>}
                  {a.published_at ? new Date(a.published_at).toLocaleDateString() : 'Draft'}
                </p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                a.status === 'published' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
              }`}>
                {a.status}
              </span>
            </div>
          ))}
          {recentArticles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No articles yet — click sync above!</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
