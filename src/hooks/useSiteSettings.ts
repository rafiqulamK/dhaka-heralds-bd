import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Settings = Record<string, string>;

let cachedSettings: Settings | null = null;
let loadPromise: Promise<Settings> | null = null;

async function fetchSettings(): Promise<Settings> {
  const { data } = await supabase.from('site_settings').select('key, value');
  const map: Settings = {};
  (data || []).forEach((row: any) => { map[row.key] = row.value || ''; });
  cachedSettings = map;
  return map;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<Settings>(cachedSettings || {});
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) { setSettings(cachedSettings); setLoading(false); return; }
    if (!loadPromise) loadPromise = fetchSettings();
    loadPromise.then(s => { setSettings(s); setLoading(false); });
  }, []);

  const refresh = async () => {
    loadPromise = null;
    cachedSettings = null;
    const s = await fetchSettings();
    setSettings(s);
  };

  const get = (key: string, fallback = '') => settings[key] || fallback;

  return { settings, loading, get, refresh };
}
