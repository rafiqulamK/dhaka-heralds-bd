import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Bot, Save, Loader2, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const PROVIDERS = [
  { value: 'lovable', label: 'Lovable AI (Default)', needsKey: false },
  { value: 'openai', label: 'OpenAI', needsKey: true },
  { value: 'google', label: 'Google Gemini', needsKey: true },
  { value: 'anthropic', label: 'Anthropic Claude', needsKey: true },
];

const MODELS: Record<string, string[]> = {
  lovable: ['google/gemini-3-flash-preview', 'google/gemini-2.5-flash', 'google/gemini-2.5-pro', 'openai/gpt-5-mini', 'openai/gpt-5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-5', 'gpt-5-mini'],
  google: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-flash-preview'],
  anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-haiku-20241022'],
};

interface AISetting {
  id: string;
  provider: string;
  api_key: string | null;
  model: string;
  is_active: boolean;
}

export default function AdminAISettings() {
  const [settings, setSettings] = useState<AISetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ provider: 'lovable', api_key: '', model: 'google/gemini-3-flash-preview' });

  const loadSettings = async () => {
    const { data } = await supabase.from('ai_settings').select('*').order('created_at', { ascending: false });
    setSettings((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const providerInfo = PROVIDERS.find(p => p.value === form.provider);
    if (providerInfo?.needsKey && !form.api_key) { toast.error('API key required for this provider'); return; }
    setSaving(true);
    // Deactivate other settings first
    await supabase.from('ai_settings').update({ is_active: false }).eq('is_active', true);
    const { error } = await supabase.from('ai_settings').insert({
      provider: form.provider,
      api_key: providerInfo?.needsKey ? form.api_key : null,
      model: form.model,
      is_active: true,
    });
    if (error) { toast.error('Failed: ' + error.message); } else {
      toast.success('AI provider configured');
      setShowForm(false);
      setForm({ provider: 'lovable', api_key: '', model: 'google/gemini-3-flash-preview' });
      loadSettings();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string) => {
    await supabase.from('ai_settings').update({ is_active: false }).neq('id', id);
    await supabase.from('ai_settings').update({ is_active: true }).eq('id', id);
    toast.success('Active provider updated');
    loadSettings();
  };

  const deleteSetting = async (id: string) => {
    if (!confirm('Delete this AI configuration?')) return;
    await supabase.from('ai_settings').delete().eq('id', id);
    toast.success('Deleted');
    loadSettings();
  };

  const selectedProvider = PROVIDERS.find(p => p.value === form.provider);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure AI provider for chatbot, summaries, and fact-checking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Provider
        </button>
      </div>

      <div className="bg-muted/30 rounded-xl p-4 border border-border mb-6">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Default:</strong> Lovable AI is pre-configured and works without an API key. Add external providers as fallbacks or for specific model preferences.
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Provider</label>
              <select value={form.provider} onChange={e => { const p = e.target.value; setForm(prev => ({ ...prev, provider: p, model: MODELS[p]?.[0] || '' })); }} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <select value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
                {(MODELS[form.provider] || []).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          {selectedProvider?.needsKey && (
            <div>
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              <input type="password" value={form.api_key} onChange={e => setForm(p => ({ ...p, api_key: e.target.value }))} className="w-full mt-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" placeholder="sk-..." />
            </div>
          )}
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Configuration
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-muted-foreground" /></div>
      ) : settings.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border">
          <Bot size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-foreground font-medium mb-1">Using Lovable AI (Default)</p>
          <p className="text-muted-foreground text-sm">No custom AI configuration. The default Lovable AI provider is active.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map(s => (
            <div key={s.id} className={`bg-card rounded-2xl border p-4 flex items-center gap-4 ${s.is_active ? 'border-primary/50' : 'border-border'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                <Bot size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{PROVIDERS.find(p => p.value === s.provider)?.label || s.provider}</p>
                  {s.is_active && <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium">Active</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Model: {s.model} • Key: {s.api_key ? '••••' + s.api_key.slice(-4) : 'Built-in'}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!s.is_active && (
                  <button onClick={() => toggleActive(s.id)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground" title="Set as active">
                    <CheckCircle2 size={14} />
                  </button>
                )}
                <button onClick={() => deleteSetting(s.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
