import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Loader2, Facebook, Youtube, Twitter, Link2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { extractYouTubeId, getYouTubeThumbnail } from '@/lib/video-utils';

function detectPlatform(url: string): string {
  if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.com')) return 'facebook';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
  return 'other';
}

function getPlatformIcon(p: string) {
  switch (p) {
    case 'facebook': return <Facebook size={14} />;
    case 'youtube': return <Youtube size={14} />;
    case 'twitter': return <Twitter size={14} />;
    default: return <Globe size={14} />;
  }
}

function generateEmbedUrl(url: string, platform: string): string | null {
  if (platform === 'youtube') {
    const id = extractYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}?rel=0` : null;
  }
  if (platform === 'facebook') {
    return `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`;
  }
  if (platform === 'twitter') {
    return null; // Twitter embeds need their widget.js
  }
  return null;
}

interface SocialPost {
  id: string;
  platform: string;
  url: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  video_embed_url: string | null;
  category_id: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
}

export default function AdminSocialPosts() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ url: '', title: '', content: '', image_url: '', category_id: '' });
  const [showForm, setShowForm] = useState(false);

  const loadData = async () => {
    const [p, c] = await Promise.all([
      supabase.from('social_posts').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('categories').select('id, name, slug'),
    ]);
    setPosts((p.data as any[]) || []);
    setCategories(c.data || []);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleUrlChange = (url: string) => {
    setForm(prev => ({ ...prev, url }));
    // Auto-detect thumbnail for YouTube
    const platform = detectPlatform(url);
    if (platform === 'youtube') {
      const id = extractYouTubeId(url);
      if (id) setForm(prev => ({ ...prev, image_url: getYouTubeThumbnail(id) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) { toast.error('URL is required'); return; }
    setSaving(true);
    const platform = detectPlatform(form.url);
    const embedUrl = generateEmbedUrl(form.url, platform);
    const payload: any = {
      platform,
      url: form.url,
      title: form.title || null,
      content: form.content || null,
      image_url: form.image_url || null,
      video_embed_url: embedUrl,
      category_id: form.category_id || null,
      status: 'published',
    };
    const { error } = await supabase.from('social_posts').insert(payload);
    if (error) { toast.error('Failed: ' + error.message); } else {
      toast.success('Social post added — it will appear on the homepage');
      setShowForm(false);
      setForm({ url: '', title: '', content: '', image_url: '', category_id: '' });
      loadData();
    }
    setSaving(false);
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this social post?')) return;
    await supabase.from('social_posts').delete().eq('id', id);
    toast.success('Deleted');
    loadData();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Social Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Share Facebook, YouTube, and Twitter URLs — they auto-display on the homepage</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Social Post
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Social Media URL *</label>
            <input value={form.url} onChange={e => handleUrlChange(e.target.value)} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="https://www.facebook.com/... or https://youtube.com/watch?v=..." />
            {form.url && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">{getPlatformIcon(detectPlatform(form.url))} Detected: {detectPlatform(form.url)}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title (optional)</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Post title" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                <option value="">Auto-detect</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
            <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={2} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none" placeholder="Brief description..." />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Image URL (auto-detected for YouTube)</label>
            <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="https://..." />
          </div>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Add Post
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Link2 size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">No social posts yet. Paste a Facebook, YouTube, or Twitter URL to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              {post.image_url ? (
                <img src={post.image_url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0 bg-muted" />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">{getPlatformIcon(post.platform)}</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{post.title || post.url}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">{getPlatformIcon(post.platform)} {post.platform}</span>
                  <span>•</span>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><Globe size={14} /></a>
                <button onClick={() => deletePost(post.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
