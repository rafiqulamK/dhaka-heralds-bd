import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2, Eye, EyeOff, ExternalLink, BarChart3, Loader2, Image } from 'lucide-react';
import { toast } from 'sonner';

const PLACEMENTS = ['sidebar', 'in-feed', 'header-banner', 'article-bottom', 'between-sections'];
const SIZES = ['300x250', '728x90', '160x600', '320x50', '970x250'];

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

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', image_url: '', link_url: '', placement: 'sidebar', size: '300x250', is_active: true, start_date: '', end_date: '' });

  const loadAds = async () => {
    const { data } = await supabase.from('advertisements').select('*').order('created_at', { ascending: false });
    setAds((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadAds(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image_url) { toast.error('Title and image URL are required'); return; }
    setSaving(true);
    const payload: any = { title: form.title, image_url: form.image_url, link_url: form.link_url || null, placement: form.placement, size: form.size, is_active: form.is_active };
    if (form.start_date) payload.start_date = form.start_date;
    if (form.end_date) payload.end_date = form.end_date;
    const { error } = await supabase.from('advertisements').insert(payload);
    if (error) { toast.error('Failed to create ad: ' + error.message); } else {
      toast.success('Ad created'); setShowForm(false);
      setForm({ title: '', image_url: '', link_url: '', placement: 'sidebar', size: '300x250', is_active: true, start_date: '', end_date: '' });
      loadAds();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('advertisements').update({ is_active: !current }).eq('id', id);
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
          <h1 className="text-2xl font-bold text-foreground">Ad Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage advertisements across the site</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> New Ad
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-4">
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
              <label className="text-xs font-medium text-muted-foreground">Link URL</label>
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
            <div className="border border-border rounded-xl p-2 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Preview:</p>
              <img src={form.image_url} alt="Ad preview" className="max-h-40 rounded-lg object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create Ad
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
            <div key={ad.id} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
              <img src={ad.image_url} alt={ad.title} className="w-20 h-14 rounded-lg object-cover shrink-0 bg-muted" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="px-2 py-0.5 bg-muted rounded-full">{ad.placement}</span>
                  <span>{ad.size}</span>
                  <span className="flex items-center gap-1"><BarChart3 size={10} /> {ad.impression_count} views</span>
                  <span>{ad.click_count} clicks</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ad.link_url && (
                  <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted text-muted-foreground"><ExternalLink size={14} /></a>
                )}
                <button onClick={() => toggleActive(ad.id, ad.is_active)} className={`p-2 rounded-lg hover:bg-muted ${ad.is_active ? 'text-accent' : 'text-muted-foreground'}`}>
                  {ad.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => deleteAd(ad.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
