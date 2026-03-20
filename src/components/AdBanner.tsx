import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  placement: string;
  size: string;
}

export default function AdBanner({ placement = 'sidebar', className = '' }: { placement?: string; className?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const load = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('advertisements')
        .select('id, title, image_url, link_url, placement, size')
        .eq('is_active', true)
        .eq('placement', placement)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .limit(1);
      if (data && data.length > 0) setAd(data[0] as any);
    };
    load();
  }, [placement]);

  if (!ad) return null;

  const handleClick = async () => {
    // Track click (fire-and-forget)
    supabase.rpc('increment_ad_click' as any, { ad_id: ad.id }).then(() => {});
  };

  const content = (
    <div className={`rounded-xl overflow-hidden border border-border/50 bg-card relative group ${className}`}>
      <img src={ad.image_url} alt={ad.title} className="w-full h-auto object-cover" />
      <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-background/80 backdrop-blur-sm">
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Sponsored</span>
      </div>
    </div>
  );

  if (ad.link_url) {
    return (
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" onClick={handleClick} className="block">
        {content}
      </a>
    );
  }

  return content;
}
