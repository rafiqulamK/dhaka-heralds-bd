import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Facebook, Youtube, Twitter, Globe, ExternalLink } from 'lucide-react';

interface SocialPost {
  id: string;
  platform: string;
  url: string;
  title: string | null;
  content: string | null;
  image_url: string | null;
  video_embed_url: string | null;
  published_at: string | null;
}

function getPlatformIcon(p: string) {
  switch (p) {
    case 'facebook': return <Facebook size={14} />;
    case 'youtube': return <Youtube size={14} />;
    case 'twitter': return <Twitter size={14} />;
    default: return <Globe size={14} />;
  }
}

function getPlatformColor(p: string) {
  switch (p) {
    case 'facebook': return 'text-blue-500';
    case 'youtube': return 'text-red-500';
    case 'twitter': return 'text-sky-500';
    default: return 'text-primary';
  }
}

export default function SocialPostsSection() {
  const [posts, setPosts] = useState<SocialPost[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('social_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(12);
      setPosts((data as any[]) || []);
    };
    load();
  }, []);

  if (posts.length === 0) return null;

  const videoPosts = posts.filter(p => p.video_embed_url);
  const otherPosts = posts.filter(p => !p.video_embed_url);

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-7 bg-primary rounded-full" />
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Globe size={20} className="text-primary" /> Social Feed
        </h2>
        <span className="flex-1 h-px bg-border" />
      </div>

      {videoPosts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          {videoPosts.slice(0, 3).map(post => (
            <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={post.video_embed_url!}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                />
              </div>
              {post.title && (
                <div className="p-4">
                  <p className="text-sm font-medium text-foreground line-clamp-2">{post.title}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className={getPlatformColor(post.platform)}>{getPlatformIcon(post.platform)}</span>
                    <a href={post.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
                      View original <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {otherPosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {otherPosts.slice(0, 8).map(post => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-card rounded-2xl border border-border overflow-hidden card-hover group"
            >
              {post.image_url && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.image_url} alt={post.title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-4">
                <p className="text-sm font-medium text-foreground line-clamp-2">{post.title || 'Social post'}</p>
                {post.content && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{post.content}</p>}
                <div className="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground">
                  <span className={getPlatformColor(post.platform)}>{getPlatformIcon(post.platform)}</span>
                  <span className="capitalize">{post.platform}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
