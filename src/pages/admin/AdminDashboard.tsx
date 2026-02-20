import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { FileText, Video, Image, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ articles: 0, videos: 0, media: 0, categories: 0 });

  useEffect(() => {
    const load = async () => {
      const [a, v, m, c] = await Promise.all([
        supabase.from('articles').select('id', { count: 'exact', head: true }),
        supabase.from('videos').select('id', { count: 'exact', head: true }),
        supabase.from('media').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
      ]);
      setStats({ articles: a.count || 0, videos: v.count || 0, media: m.count || 0, categories: c.count || 0 });
    };
    load();
  }, []);

  const cards = [
    { icon: FileText, label: 'Articles', value: stats.articles, href: '/admin/articles', color: 'text-blue-400' },
    { icon: Video, label: 'Videos', value: stats.videos, href: '/admin/videos', color: 'text-purple-400' },
    { icon: Image, label: 'Media Files', value: stats.media, href: '/admin/media', color: 'text-green-400' },
    { icon: TrendingUp, label: 'Categories', value: stats.categories, href: '/admin/categories', color: 'text-primary' },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold gold-text">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to Dhaka Heralds Admin Panel</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ icon: Icon, label, value, href, color }) => (
          <Link key={label} to={href} className="bg-card rounded-xl gold-border p-5 card-hover block">
            <div className="flex items-center justify-between mb-3">
              <Icon size={20} className={color} />
              <span className="text-3xl font-bold text-foreground">{value}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
          </Link>
        ))}
      </div>
      <div className="bg-card rounded-xl gold-border p-6">
        <h2 className="font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/admin/articles" className="gold-gradient text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium text-center hover:opacity-90 transition-opacity">
            + New Article
          </Link>
          <Link to="/admin/videos" className="gold-gradient text-primary-foreground rounded-lg px-4 py-3 text-sm font-medium text-center hover:opacity-90 transition-opacity">
            + New Video
          </Link>
          <Link to="/admin/categories" className="bg-secondary text-secondary-foreground rounded-lg px-4 py-3 text-sm font-medium text-center hover:opacity-90 transition-opacity">
            + New Category
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
