import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Facebook, Instagram, Linkedin, Twitter, Link2, Unlink, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

interface SocialAccount {
  platform: string;
  icon: React.ElementType;
  color: string;
  connected: boolean;
  pageName?: string;
  description: string;
}

export default function AdminSocial() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([
    { platform: 'Facebook', icon: Facebook, color: 'text-primary', connected: false, description: 'Connect your Facebook Page to auto-publish articles' },
    { platform: 'Instagram', icon: Instagram, color: 'text-primary', connected: false, description: 'Share articles and images to your Instagram account' },
    { platform: 'LinkedIn', icon: Linkedin, color: 'text-primary', connected: false, description: 'Publish professional content to LinkedIn Company Page' },
    { platform: 'X (Twitter)', icon: Twitter, color: 'text-primary', connected: false, description: 'Tweet breaking news and article links' },
  ]);

  const handleConnect = (platform: string) => {
    // In production, this would initiate OAuth flow
    setAccounts(prev =>
      prev.map(a =>
        a.platform === platform
          ? { ...a, connected: !a.connected, pageName: !a.connected ? `Dhaka Heralds ${platform}` : undefined }
          : a
      )
    );
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold gold-text">Social Media</h1>
        <p className="text-sm text-muted-foreground mt-1">Connect your social accounts to publish articles across platforms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {accounts.map(account => {
          const Icon = account.icon;
          return (
            <div key={account.platform} className="bg-card rounded-xl gold-border p-5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ${account.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-foreground">{account.platform}</h3>
                  <p className="text-xs text-muted-foreground">{account.description}</p>
                </div>
                {account.connected ? (
                  <CheckCircle2 size={18} className="text-accent" />
                ) : (
                  <AlertCircle size={18} className="text-muted-foreground/40" />
                )}
              </div>

              {account.connected && account.pageName && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <ExternalLink size={12} />
                  <span>Connected as: <span className="text-foreground font-medium">{account.pageName}</span></span>
                </div>
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

      {/* Publishing section */}
      <div className="bg-card rounded-xl gold-border p-6">
        <h2 className="text-lg font-bold text-foreground mb-2">Auto-Publish Settings</h2>
        <p className="text-sm text-muted-foreground mb-4">
          When enabled, newly published articles will be automatically shared to connected platforms.
        </p>
        <div className="space-y-3">
          {accounts.filter(a => a.connected).map(account => {
            const Icon = account.icon;
            return (
              <label key={account.platform} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="accent-primary w-4 h-4" />
                <Icon size={16} className={account.color} />
                <span className="text-sm text-foreground">Auto-publish to {account.platform}</span>
              </label>
            );
          })}
          {accounts.filter(a => a.connected).length === 0 && (
            <p className="text-sm text-muted-foreground italic">Connect at least one social account to enable auto-publishing.</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-muted/30 rounded-xl p-4 border border-border">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Note:</strong> Social media API integration requires configuring OAuth credentials for each platform. 
          Contact your administrator to set up Facebook App, Instagram Basic Display API, LinkedIn OAuth, and X (Twitter) API v2 credentials.
        </p>
      </div>
    </AdminLayout>
  );
}
