import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Eye, EyeOff, ExternalLink, BarChart3, Loader2, Image, Pencil, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const PLACEMENTS = ['sidebar', 'in-feed', 'header-banner', 'article-bottom', 'between-sections'];
const SIZES = ['300x250', '728x90', '160x600', '320x50', '970x250', '468x60'];

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  placement: string;
  size: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
}

const emptyForm = { title: '', image_url: '', link_url: '', placement: 'sidebar', size: '300x250', is_active: true, start_date: '', end_date: '' };

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const loadAds = async () => {
    const { data } = await supabase.from('advertisements').select('*').order('created_at', { ascending: false });
    setAds((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadAds(); }, []);

  const startEdit = (ad: Ad) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url || '',
      placement: ad.placement,
      size: ad.size,
      is_active: ad.is_active,
      start_date: ad.start_date?.split('T')[0] || '',
      end_date: ad.end_date?.split('T')[0] || '',
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) { toast.error('Title and image URL are required'); return; }
    setSaving(true);
    const payload: any = {
      title: form.title,
      image_url: form.image_url,
      link_url: form.link_url || null,
      placement: form.placement,
      size: form.size,
      is_active: form.is_active,
    };
    if (form.start_date) payload.start_date = form.start_date;
    else payload.start_date = null;
    if (form.end_date) payload.end_date = form.end_date;
    else payload.end_date = null;

    let error;
    if (editingId) {
      ({ error } = await supabase.from('advertisements').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('advertisements').insert(payload));
    }

    if (error) {
      toast.error(`Failed: ${error.message}`);
    } else {
      toast.success(editingId ? 'Ad updated' : 'Ad created');
      cancelEdit();
      loadAds();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('advertisements').update({ is_active: !current }).eq('id', id);
    toast.success(`Ad ${current ? 'paused' : 'activated'}`);
    loadAds();
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Delete this ad?')) return;
    await supabase.from('advertisements').delete().eq('id', id);
    toast.success('Ad deleted');
    loadAds();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Ad Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create, edit and manage advertisements</p>
        </div>
        <button
          onClick={() => { if (showForm && !editingId) { cancelEdit(); } else { setEditingId(null); setForm({ ...emptyForm }); setShowForm(true); } }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm && !editingId ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Ad</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground text-sm">{editingId ? '✏️ Edit Ad' : '➕ New Ad'}</h3>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <X size={12} /> Cancel
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Ad title" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Image URL *</label>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Click-through URL</label>
              <input value={form.link_url} onChange={e => setForm(p => ({ ...p, link_url: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Placement</label>
              <select value={form.placement} onChange={e => setForm(p => ({ ...p, placement: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                {PLACEMENTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Size</label>
              <select value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="accent-primary w-4 h-4" />
                <span className="text-sm text-foreground">Active</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
          </div>
          {form.image_url && (
            <div className="border border-border rounded-xl p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Preview:</p>
              <img src={form.image_url} alt="Ad preview" className="max-h-40 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : editingId ? <Save size={14} /> : <Plus size={14} />}
            {editingId ? 'Update Ad' : 'Create Ad'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground"><Loader2 className="animate-spin mx-auto" /></div>
      ) : ads.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Image size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">No advertisements yet. Click "New Ad" to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map(ad => (
            <div key={ad.id} className="bg-card rounded-2xl border border-border p-4">
              <div className="flex items-center gap-4">
                <img src={ad.image_url} alt={ad.title} className="w-20 h-14 rounded-lg object-cover shrink-0 bg-muted" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 bg-muted rounded-full">{ad.placement}</span>
                    <span className="px-2 py-0.5 bg-muted rounded-full">{ad.size}</span>
                    <span className={`px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'}`}>
                      {ad.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Eye size={10} /> {ad.impression_count} impressions</span>
                    <span className="flex items-center gap-1"><BarChart3 size={10} /> {ad.click_count} clicks</span>
                    {ad.link_url && (
                      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline" onClick={e => e.stopPropagation()}>
                        <ExternalLink size={10} /> {ad.link_url.substring(0, 30)}...
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => startEdit(ad)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => toggleActive(ad.id, ad.is_active)} className={`p-2 rounded-lg hover:bg-muted ${ad.is_active ? 'text-accent' : 'text-muted-foreground'}`} title={ad.is_active ? 'Pause' : 'Activate'}>
                    {ad.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => deleteAd(ad.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
