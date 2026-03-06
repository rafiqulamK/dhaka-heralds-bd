import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Facebook, Instagram, Linkedin, Twitter, Link2, Unlink, ExternalLink, CheckCircle2, AlertCircle, RefreshCw, Loader2, Send, Clock, ArrowUpRight, ArrowDownLeft, Settings2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocialAccount {
  platform: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
  pageName?: string;
  description: string;
  lastSync?: string;
  postCount?: number;
  autoPublish: boolean;
  syncDirection: 'push' | 'pull' | 'both';
}

interface SyncLog {
  id: string;
  platform: string;
  direction: 'push' | 'pull';
  status: 'success' | 'failed' | 'pending';
  articleTitle: string;
  timestamp: Date;
}

export default function AdminSocial() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'Facebook', icon: Facebook, color: 'text-primary', connected: false, description: 'Auto-publish articles and sync engagement from your Facebook Page', autoPublish: true, syncDirection: 'both', postCount: 0 },
    { platform: 'Instagram', icon: Instagram, color: 'text-primary', connected: false, description: 'Share articles, images, and stories to your Instagram account', autoPublish: true, syncDirection: 'push', postCount: 0 },
    { platform: 'LinkedIn', icon: Linkedin, color: 'text-primary', connected: false, description: 'Publish professional content and sync to LinkedIn Company Page', autoPublish: true, syncDirection: 'both', postCount: 0 },
    { platform: 'X (Twitter)', icon: Twitter, color: 'text-primary', connected: false, description: 'Auto-tweet breaking news and article links, pull mentions', autoPublish: true, syncDirection: 'both', postCount: 0 },
  ]);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase.from('articles').select('id, title, slug, status').eq('status', 'published').order('published_at', { ascending: false }).limit(20)
      .then(({ data }) => setArticles(data || []));
  }, []);

  const handleConnect = (platform: string) => {
    setAccounts(prev =>
      prev.map(a =>
        a.platform === platform
          ? {
              ...a,
              connected: !a.connected,
              pageName: !a.connected ? `Dhaka Heralds ${platform}` : undefined,
              lastSync: !a.connected ? new Date().toISOString() : undefined,
            }
          : a
      )
    );
    toast.success(`${platform} ${accounts.find(a => a.platform === platform)?.connected ? 'disconnected' : 'connected'} successfully`);
  };

  const toggleAutoPublish = (platform: string) => {
    setAccounts(prev =>
      prev.map(a =>
        a.platform === platform ? { ...a, autoPublish: !a.autoPublish } : a
      )
    );
  };

  const cycleSyncDirection = (platform: string) => {
    const order: Array<'push' | 'pull' | 'both'> = ['push', 'pull', 'both'];
    setAccounts(prev =>
      prev.map(a => {
        if (a.platform !== platform) return a;
        const idx = order.indexOf(a.syncDirection);
        return { ...a, syncDirection: order[(idx + 1) % 3] };
      })
    );
  };

  const handleSyncAll = async () => {
    const connected = accounts.filter(a => a.connected);
    if (connected.length === 0) { toast.error('No connected platforms'); return; }
    setSyncing(true);
    // Simulate sync with each connected platform
    await new Promise(r => setTimeout(r, 2000));
    const newLogs: SyncLog[] = connected.map(a => ({
      id: crypto.randomUUID(),
      platform: a.platform,
      direction: a.syncDirection === 'both' ? 'push' : a.syncDirection,
      status: 'success' as const,
      articleTitle: 'Latest content sync',
      timestamp: new Date(),
    }));
    setSyncLogs(prev => [...newLogs, ...prev].slice(0, 20));
    setAccounts(prev => prev.map(a => a.connected ? { ...a, lastSync: new Date().toISOString(), postCount: (a.postCount || 0) + 1 } : a));
    setSyncing(false);
    toast.success(`Synced with ${connected.length} platform(s)`);
  };

  const handlePostToSelected = async () => {
    if (!selectedArticle || selectedPlatforms.length === 0) {
      toast.error('Select an article and at least one platform');
      return;
    }
    setPosting(true);
    await new Promise(r => setTimeout(r, 1500));
    const article = articles.find(a => a.id === selectedArticle);
    const newLogs: SyncLog[] = selectedPlatforms.map(p => ({
      id: crypto.randomUUID(),
      platform: p,
      direction: 'push' as const,
      status: 'success' as const,
      articleTitle: article?.title || 'Unknown',
      timestamp: new Date(),
    }));
    setSyncLogs(prev => [...newLogs, ...prev].slice(0, 20));
    setPosting(false);
    setSelectedArticle('');
    setSelectedPlatforms([]);
    toast.success(`Posted to ${selectedPlatforms.length} platform(s)`);
  };

  const connectedAccounts = accounts.filter(a => a.connected);
  const SYNC_DIR_LABELS = { push: 'Push only', pull: 'Pull only', both: 'Bi-directional' };
  const SYNC_DIR_ICONS = { push: <ArrowUpRight size={12} />, pull: <ArrowDownLeft size={12} />, both: <RefreshCw size={12} /> };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold gold-text">Social Media</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect, sync, and auto-publish across all platforms</p>
        </div>
        <button
          onClick={handleSyncAll}
          disabled={syncing || connectedAccounts.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
        >
          {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Sync All Platforms
        </button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {accounts.map(account => {
          const Icon = account.icon;
          return (
            <div key={account.platform} className="bg-card rounded-xl gold-border p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground">{account.platform}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{account.description}</p>
                </div>
                {account.connected ? (
                  <CheckCircle2 size={18} className="text-accent shrink-0" />
                ) : (
                  <AlertCircle size={18} className="text-muted-foreground/40 shrink-0" />
                )}
              </div>

              {account.connected && (
                <>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                    <ExternalLink size={12} />
                    <span>Connected as: <span className="text-foreground font-medium">{account.pageName}</span></span>
                  </div>

                  {/* Sync settings row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => cycleSyncDirection(account.platform)}
                      className="flex items-center gap-1.5 text-xs bg-muted/50 hover:bg-muted px-2.5 py-1.5 rounded-lg transition-colors text-muted-foreground"
                      title="Click to change sync direction"
                    >
                      {SYNC_DIR_ICONS[account.syncDirection]}
                      {SYNC_DIR_LABELS[account.syncDirection]}
                    </button>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={account.autoPublish}
                        onChange={() => toggleAutoPublish(account.platform)}
                        className="accent-primary w-3.5 h-3.5"
                      />
                      <span className="text-muted-foreground">Auto-publish</span>
                    </label>
                    {account.lastSync && (
                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 ml-auto">
                        <Clock size={10} />
                        Last: {new Date(account.lastSync).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </>
              )}

              <button
                onClick={() => handleConnect(account.platform)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  account.connected
                    ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                    : 'gold-gradient text-primary-foreground hover:opacity-90'
                }`}
              >
                {account.connected ? (
                  <><Unlink size={14} /> Disconnect</>
                ) : (
                  <><Link2 size={14} /> Connect</>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Post */}
      <div className="bg-card rounded-xl gold-border p-6 mb-6">
        <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
          <Send size={16} className="text-primary" /> Quick Post to Platforms
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Select an article and platforms to post immediately</p>

        <div className="space-y-4">
          <select
            value={selectedArticle}
            onChange={(e) => setSelectedArticle(e.target.value)}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="">Select an article…</option>
            {articles.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>

          <div className="flex flex-wrap gap-2">
            {connectedAccounts.map(account => {
              const Icon = account.icon;
              const selected = selectedPlatforms.includes(account.platform);
              return (
                <button
                  key={account.platform}
                  onClick={() => setSelectedPlatforms(prev => selected ? prev.filter(p => p !== account.platform) : [...prev, account.platform])}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selected ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-muted/50 text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <Icon size={14} />
                  {account.platform}
                </button>
              );
            })}
            {connectedAccounts.length === 0 && (
              <p className="text-xs text-muted-foreground italic">Connect at least one platform above</p>
            )}
          </div>

          <button
            onClick={handlePostToSelected}
            disabled={posting || !selectedArticle || selectedPlatforms.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gold-gradient text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Post Now
          </button>
        </div>
      </div>

      {/* Sync Logs */}
      {syncLogs.length > 0 && (
        <div className="bg-card rounded-xl gold-border p-6 mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Settings2 size={16} className="text-primary" /> Sync Activity
          </h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {syncLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 text-xs bg-muted/30 rounded-lg px-3 py-2">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${log.status === 'success' ? 'bg-accent' : log.status === 'failed' ? 'bg-destructive' : 'bg-primary'}`} />
                <span className="font-medium text-foreground">{log.platform}</span>
                <span className="text-muted-foreground">{log.direction === 'push' ? '→' : '←'}</span>
                <span className="text-muted-foreground truncate flex-1">{log.articleTitle}</span>
                <span className="text-muted-foreground/60 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Publish Settings */}
      <div className="bg-card rounded-xl gold-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Auto-Publish Settings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          When enabled, newly published articles will be automatically shared to connected platforms.
        </p>
        <div className="space-y-3">
          {connectedAccounts.map(account => {
            const Icon = account.icon;
            return (
              <label key={account.platform} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={account.autoPublish}
                  onChange={() => toggleAutoPublish(account.platform)}
                  className="accent-primary w-4 h-4"
                />
                <Icon size={16} className="text-primary" />
                <span className="text-sm text-foreground">Auto-publish to {account.platform}</span>
                <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                  {SYNC_DIR_ICONS[account.syncDirection]}
                  {SYNC_DIR_LABELS[account.syncDirection]}
                </span>
              </label>
            );
          })}
          {connectedAccounts.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Connect at least one social account to enable auto-publishing.</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-muted/30 rounded-xl p-4 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Social media API integration requires OAuth credentials for each platform.
          Once configured, articles will automatically sync in the selected direction. Contact your administrator to set up API credentials.
        </p>
      </div>
    </AdminLayout>
  );
}
