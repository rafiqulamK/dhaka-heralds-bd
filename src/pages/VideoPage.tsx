import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Play, Eye } from 'lucide-react';
import { getVideoEmbedUrl } from '@/lib/video-utils';

export default function VideoPage() {
  const { slug } = useParams<{ slug: string }>();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*, categories(name, slug)')
        .eq('slug', slug!)
        .single();
      setVideo(data);
      setLoading(false);
      if (data) {
        supabase.from('videos').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id);
      }
    };
    load();
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const embed = video ? getVideoEmbedUrl(video) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        {video ? (
          <>
            {video.categories && (
              <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded mb-4 uppercase tracking-wider">
                {video.categories.name}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">{video.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              {video.view_count != null && <span className="flex items-center gap-1.5"><Eye size={14} />{video.view_count.toLocaleString()} views</span>}
            </div>
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-border mb-6">
              {embed && (embed.type === 'youtube' || embed.type === 'vimeo' || embed.type === 'facebook') && embed.embedUrl ? (
                <iframe
                  src={embed.embedUrl}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={video.title}
                />
              ) : embed?.type === 'upload' && embed.embedUrl ? (
                <video src={embed.embedUrl} controls className="w-full h-full" poster={video.thumbnail_url || undefined} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-card">
                  <div className="text-center">
                    <Play size={48} className="text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Video coming soon</p>
                  </div>
                </div>
              )}
            </div>
            {video.description && (
              <p className="text-muted-foreground leading-relaxed text-lg border-l-4 border-primary pl-4">{video.description}</p>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground">Video not found</h1>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
