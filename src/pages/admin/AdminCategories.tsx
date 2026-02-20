import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
}

const emptyForm: CategoryFormData = { name: '', slug: '', description: '', color: '#D4A017' };

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CategoryFormData>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    setCategories(data || []);
  };

  useEffect(() => { load(); }, []);

  const slugify = (t: string) => t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      color: form.color,
    };
    const { error } = editId
      ? await supabase.from('categories').update(payload).eq('id', editId)
      : await supabase.from('categories').insert(payload);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: editId ? 'Category updated' : 'Category created' });
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
    }
    setLoading(false);
  };

  const handleEdit = (c: any) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || '', color: c.color || '#D4A017' });
    setEditId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    load();
    toast({ title: 'Category deleted' });
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gold-text">Categories</h1>
        <button onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null); }} className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl gold-border w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-foreground mb-5">{editId ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: f.slug || slugify(e.target.value) }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Bangladesh" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Slug *</label>
                <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="bangladesh" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="w-10 h-10 rounded bg-muted border border-border cursor-pointer" />
                  <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="gold-gradient text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
                  {loading ? 'Saving...' : (editId ? 'Update' : 'Create')}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="bg-muted text-foreground px-5 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(c => (
          <div key={c.id} className="bg-card rounded-xl gold-border p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <div>
                <div className="font-semibold text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">/{c.slug}</div>
                {c.description && <div className="text-xs text-muted-foreground mt-1">{c.description}</div>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(c)} className="p-1.5 text-muted-foreground hover:text-primary"><Edit size={14} /></button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">No categories yet.</div>
        )}
      </div>
    </AdminLayout>
  );
}
