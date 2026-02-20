import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  published_at: string | null;
  view_count: number | null;
  categories?: { name: string } | null;
}

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category_id: string;
  status: string;
  featured: boolean;
  tags: string;
}

const emptyForm: ArticleFormData = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '', category_id: '', status: 'draft', featured: false, tags: ''
};

export default function AdminArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ArticleFormData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const load = async () => {
    const [a, c] = await Promise.all([
      supabase.from('articles').select('*, categories(name)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    setArticles(a.data || []);
    setCategories(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const slugify = (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      content: form.content || null,
      cover_image_url: form.cover_image_url || null,
      category_id: form.category_id || null,
      status: form.status,
      featured: form.featured,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : null,
      author_id: user?.id,
      published_at: form.status === 'published' ? new Date().toISOString() : null,
    };
    const { error } = editId
      ? await supabase.from('articles').update(payload).eq('id', editId)
      : await supabase.from('articles').insert(payload);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editId ? 'Article updated' : 'Article created' });
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    }
    setLoading(false);
  };

  const handleEdit = (a: any) => {
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt || '', content: a.content || '', cover_image_url: a.cover_image_url || '', category_id: a.category_id || '', status: a.status, featured: a.featured || false, tags: a.tags?.join(', ') || '' });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article?')) return;
    await supabase.from('articles').delete().eq('id', id);
    load();
    toast({ title: 'Article deleted' });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gold-text">Articles</h1>
        <button onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }} className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Article
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-card rounded-xl gold-border w-full max-w-2xl my-8 p-6">
            <h2 className="text-lg font-bold text-foreground mb-5">{editId ? 'Edit Article' : 'New Article'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
                  <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Article title" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Slug *</label>
                  <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="article-slug" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Brief description..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Content</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={8} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono" placeholder="Article content..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Cover Image URL</label>
                  <input value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="tag1, tag2, tag3" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-primary" />
                <span className="text-sm text-foreground">Featured article</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="gold-gradient text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : (editId ? 'Update' : 'Create Article')}
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
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Status</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {articles.map(a => (
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground line-clamp-1">{a.title}</div>
                  {a.featured && <span className="text-xs text-primary font-medium">Featured</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{(a as any).categories?.name || '—'}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'published' ? 'bg-green-500/20 text-green-400' : a.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-muted text-muted-foreground'}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(a)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Edit size={14} /></button>
                    <button onClick={() => handleDelete(a.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {articles.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">No articles yet. Create your first article!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
