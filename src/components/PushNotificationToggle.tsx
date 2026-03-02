import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';

const VAPID_PUBLIC_KEY = 'BDummyKeyForDevelopment_ReplaceWithRealVAPIDKey1234567890';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushNotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg: any) => {
        reg.pushManager?.getSubscription().then((sub: any) => {
          setSubscribed(!!sub);
        });
      });
    }
  }, []);

  const handleToggle = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }

    setLoading(true);
    try {
      if (subscribed) {
        const reg: any = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager?.getSubscription();
        if (sub) await sub.unsubscribe();
        setSubscribed(false);
      } else {
        const perm = await Notification.requestPermission();
        setPermission(perm);
        if (perm === 'granted') {
          const reg: any = await navigator.serviceWorker.ready;
          await reg.pushManager?.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          });
          setSubscribed(true);
        }
      }
    } catch (err) {
      console.error('Push notification error:', err);
    } finally {
      setLoading(false);
    }
  }, [subscribed]);

  if (!('Notification' in window)) return null;

  const Icon = subscribed ? BellRing : permission === 'denied' ? BellOff : Bell;
  const title = subscribed
    ? 'Notifications on — click to turn off'
    : permission === 'denied'
    ? 'Notifications blocked in browser settings'
    : 'Get breaking news alerts';

  return (
    <button
      onClick={handleToggle}
      disabled={loading || permission === 'denied'}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        subscribed
          ? 'text-primary hover:bg-primary/10'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      } disabled:opacity-40`}
    >
      <Icon size={18} />
    </button>
  );
}
