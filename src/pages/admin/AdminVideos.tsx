import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface VideoFormData {
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  video_type: string;
  external_url: string;
  duration_seconds: string;
  category_id: string;
  status: string;
  featured: boolean;
  tags: string;
}

const emptyForm: VideoFormData = {
  title: '', slug: '', description: '', thumbnail_url: '', video_type: 'youtube', external_url: '', duration_seconds: '', category_id: '', status: 'draft', featured: false, tags: ''
};

export default function AdminVideos() {
  const [videos, setVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VideoFormData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const load = async () => {
    const [v, c] = await Promise.all([
      supabase.from('videos').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setVideos(v.data || []);
    setCategories(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const slugify = (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${user?.id}/${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('media-videos').upload(path, file);
    if (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } else {
      const { data: { publicUrl } } = supabase.storage.from('media-videos').getPublicUrl(path);
      setForm(f => ({ ...f, video_type: 'upload', external_url: publicUrl }));
      await supabase.from('media').insert({ file_name: file.name, file_url: publicUrl, file_type: 'video', file_size: file.size, bucket_path: path, uploaded_by: user?.id });
      toast({ title: 'Video uploaded!' });
    }
    setUploading(false);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${user?.id}/thumb-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('media-images').upload(path, file);
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('media-images').getPublicUrl(path);
      setForm(f => ({ ...f, thumbnail_url: publicUrl }));
      toast({ title: 'Thumbnail uploaded!' });
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || null,
      thumbnail_url: form.thumbnail_url || null,
      video_type: form.video_type,
      video_url: form.video_type === 'upload' ? form.external_url : null,
      external_url: form.video_type !== 'upload' ? form.external_url : null,
      duration_seconds: form.duration_seconds ? parseInt(form.duration_seconds) : null,
      category_id: form.category_id || null,
      status: form.status,
      featured: form.featured,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : null,
      author_id: user?.id,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    };
    const { error } = editId
      ? await supabase.from('videos').update(payload).eq('id', editId)
      : await supabase.from('videos').insert(payload);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editId ? 'Video updated' : 'Video created' });
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    }
    setLoading(false);
  };

  const handleEdit = (v: any) => {
    setForm({ title: v.title, slug: v.slug, description: v.description || '', thumbnail_url: v.thumbnail_url || '', video_type: v.video_type || 'youtube', external_url: v.external_url || v.video_url || '', duration_seconds: v.duration_seconds?.toString() || '', category_id: v.category_id || '', status: v.status, featured: v.featured || false, tags: v.tags?.join(', ') || '' });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    await supabase.from('videos').delete().eq('id', id);
    load();
    toast({ title: 'Video deleted' });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gold-text">Videos & Documentaries</h1>
        <button onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }} className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Video
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-card rounded-xl gold-border w-full max-w-2xl my-8 p-6">
            <h2 className="text-lg font-bold text-foreground mb-5">{editId ? 'Edit Video' : 'New Video'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Video Type</label>
                <select value={form.video_type} onChange={e => setForm(f => ({ ...f, video_type: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="youtube">YouTube URL</option>
                  <option value="vimeo">Vimeo URL</option>
                  <option value="upload">Upload Video File</option>
                </select>
              </div>
              {form.video_type === 'upload' ? (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Upload Video File</label>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
                  {form.external_url && <p className="text-xs text-green-400 mt-1">✓ Video uploaded</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Video URL (YouTube/Vimeo embed or watch URL)</label>
                  <input value={form.external_url} onChange={e => setForm(f => ({ ...f, external_url: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Thumbnail</label>
                  <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground" />
                  <input value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1" placeholder="or paste image URL" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Duration (seconds)</label>
                  <input type="number" value={form.duration_seconds} onChange={e => setForm(f => ({ ...f, duration_seconds: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 3600 for 1 hour" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
                <span className="text-sm text-foreground">Featured video</span>
              </label>
              {uploading && <p className="text-xs text-primary animate-pulse">Uploading file...</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading || uploading} className="gold-gradient text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : (editId ? 'Update' : 'Create Video')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} className="bg-muted text-foreground px-5 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl gold-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Type</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {videos.map(v => (
              <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground line-clamp-1">{v.title}</div>
                  {v.featured && <span className="text-xs text-primary font-medium">Featured</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell capitalize">{v.video_type}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{v.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(v)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(v.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {videos.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No videos yet. Upload your first video!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
