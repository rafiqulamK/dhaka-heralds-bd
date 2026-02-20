import { Link } from 'react-router-dom';
import { Play, Clock, Eye } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  view_count?: number | null;
  published_at?: string | null;
  categories?: { name: string } | null;
}

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'featured' | 'compact';
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export default function VideoCard({ video, variant = 'default' }: VideoCardProps) {
  const placeholder = `https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800&q=80`;
  const imgSrc = video.thumbnail_url || placeholder;

  if (variant === 'featured') {
    return (
      <Link to={`/video/${video.slug}`} className="block group relative overflow-hidden rounded-lg gold-border card-hover">
        <div className="aspect-video overflow-hidden">
          <img src={imgSrc} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play size={24} className="text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
          {video.duration_seconds && (
            <span className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs px-2 py-0.5 rounded font-mono">
              {formatDuration(video.duration_seconds)}
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {video.categories && (
            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded mb-2 uppercase">
              {video.categories.name}
            </span>
          )}
          <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{video.title}</h2>
          {video.description && <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{video.description}</p>}
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/video/${video.slug}`} className="block group rounded-lg overflow-hidden gold-border card-hover bg-card">
      <div className="relative aspect-video overflow-hidden">
        <img src={imgSrc} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-background/20 group-hover:bg-background/10 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={18} className="text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        {video.duration_seconds && (
          <span className="absolute bottom-2 right-2 bg-background/80 text-foreground text-xs px-1.5 py-0.5 rounded font-mono">
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>
      <div className="p-4">
        {video.categories && (
          <span className="text-primary text-xs font-bold uppercase tracking-wide">{video.categories.name}</span>
        )}
        <h3 className="text-base font-bold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">{video.title}</h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          {video.view_count != null && <span className="flex items-center gap-1"><Eye size={11} />{video.view_count.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
}
