import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled || dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 bg-card border border-border rounded-xl shadow-2xl p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Download size={20} className="text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">Install Dhaka Heralds</p>
        <p className="text-xs text-muted-foreground mt-0.5">Get instant access to news with our app</p>
        <button
          onClick={handleInstall}
          className="mt-2 text-xs font-bold bg-primary text-primary-foreground px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
        >
          Install App
        </button>
      </div>
      <button onClick={() => setDismissed(true)} className="p-1 text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
  );
}
