import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Save, Loader2, Palette, Type, Image, FileText, Globe, Settings } from 'lucide-react';
import { toast } from 'sonner';

type SettingsMap = Record<string, string>;

const TABS = [
  { id: 'branding', label: 'Branding', icon: Image },
  { id: 'hero', label: 'Hero & CTA', icon: Type },
  { id: 'footer', label: 'Footer', icon: Globe },
  { id: 'theme', label: 'Theme Colors', icon: Palette },
  { id: 'pages', label: 'Page Content', icon: FileText },
];

function Field({ label, value, onChange, type = 'text', rows }: { label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number }) {
  const cls = "w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none";
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {rows ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} className={cls + " font-mono"} />
      ) : type === 'color' ? (
        <div className="flex items-center gap-3 mt-1">
          <input type="text" value={value} onChange={e => onChange(e.target.value)} className={cls} placeholder="348 80% 48%" />
          <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ background: `hsl(${value})` }} />
        </div>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className={cls} />
      )}
    </div>
  );
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [original, setOriginal] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('branding');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      const map: SettingsMap = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value || ''; });
      setSettings(map);
      setOriginal(map);
      setLoading(false);
    })();
  }, []);

  const set = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    const changed = Object.entries(settings).filter(([k, v]) => original[k] !== v);
    for (const [key, value] of changed) {
      await supabase.from('site_settings').update({ value }).eq('key', key);
    }

    // Apply theme colors live
    if (settings.primary_color !== original.primary_color) {
      document.documentElement.style.setProperty('--primary', settings.primary_color);
    }
    if (settings.accent_color !== original.accent_color) {
      document.documentElement.style.setProperty('--accent', settings.accent_color);
    }

    setOriginal({ ...settings });
    toast.success(`${changed.length} setting(s) saved`);
    setSaving(false);
  };

  const hasChanges = Object.entries(settings).some(([k, v]) => original[k] !== v);

  if (loading) return <AdminLayout><div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2"><Settings size={22} /> Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage branding, content, theme and pages</p>
        </div>
        <button onClick={save} disabled={!hasChanges || saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        {tab === 'branding' && (
          <>
            <Field label="Site Name" value={settings.site_name || ''} onChange={v => set('site_name', v)} />
            <Field label="Site Tagline" value={settings.site_tagline || ''} onChange={v => set('site_tagline', v)} />
            <Field label="Logo URL (leave empty for default)" value={settings.logo_url || ''} onChange={v => set('logo_url', v)} />
            {settings.logo_url && (
              <div className="border border-border rounded-xl p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">Logo Preview:</p>
                <img src={settings.logo_url} alt="Logo preview" className="h-16 w-16 rounded-xl object-cover" />
              </div>
            )}
          </>
        )}

        {tab === 'hero' && (
          <>
            <Field label="Hero Title" value={settings.hero_title || ''} onChange={v => set('hero_title', v)} />
            <Field label="Hero Subtitle" value={settings.hero_subtitle || ''} onChange={v => set('hero_subtitle', v)} />
            <Field label="CTA Button Text" value={settings.cta_text || ''} onChange={v => set('cta_text', v)} />
            <Field label="CTA Button Link" value={settings.cta_link || ''} onChange={v => set('cta_link', v)} />
          </>
        )}

        {tab === 'footer' && (
          <>
            <Field label="Footer Description" value={settings.footer_description || ''} onChange={v => set('footer_description', v)} rows={3} />
            <Field label="Contact Email" value={settings.footer_email || ''} onChange={v => set('footer_email', v)} />
            <Field label="Copyright Text" value={settings.footer_copyright || ''} onChange={v => set('footer_copyright', v)} />
            <Field label="Footer Tagline" value={settings.footer_tagline || ''} onChange={v => set('footer_tagline', v)} />
          </>
        )}

        {tab === 'theme' && (
          <>
            <p className="text-xs text-muted-foreground">Enter HSL values without parentheses, e.g. <code className="bg-muted px-1 rounded">348 80% 48%</code></p>
            <Field label="Primary Color (HSL)" value={settings.primary_color || ''} onChange={v => set('primary_color', v)} type="color" />
            <Field label="Accent Color (HSL)" value={settings.accent_color || ''} onChange={v => set('accent_color', v)} type="color" />
          </>
        )}

        {tab === 'pages' && (
          <>
            <Field label="About Page Content (Markdown)" value={settings.about_content || ''} onChange={v => set('about_content', v)} rows={10} />
            <Field label="Contact Page Content (Markdown)" value={settings.contact_content || ''} onChange={v => set('contact_content', v)} rows={8} />
            <Field label="Privacy Policy (Markdown)" value={settings.privacy_content || ''} onChange={v => set('privacy_content', v)} rows={10} />
            <Field label="Terms of Service (Markdown)" value={settings.terms_content || ''} onChange={v => set('terms_content', v)} rows={10} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
