import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
  view_count?: number | null;
  categories?: { name: string; slug: string } | null;
}

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const placeholderImg = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80`;
  const imgSrc = article.cover_image_url || placeholderImg;

  if (variant === 'featured') {
    return (
      <Link to={`/article/${article.slug}`} className="block group relative overflow-hidden rounded-lg gold-border card-hover h-full">
        <div className="aspect-[16/10] overflow-hidden">
          <img src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5">
          {article.categories && (
            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded mb-2 uppercase tracking-wider">
              {article.categories.name}
            </span>
          )}
          <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight mb-2 group-hover:text-primary transition-colors">
            {article.title}
          </h2>
          {article.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            {article.published_at && <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(article.published_at)}</span>}
            {article.view_count != null && <span className="flex items-center gap-1"><Eye size={11} />{article.view_count.toLocaleString()}</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.slug}`} className="flex gap-3 group card-hover p-2 rounded">
        <div className="w-24 h-20 shrink-0 overflow-hidden rounded">
          <img src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          {article.categories && (
            <span className="text-primary text-xs font-bold uppercase tracking-wide">{article.categories.name}</span>
          )}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors mt-0.5">{article.title}</h3>
          {article.published_at && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><Clock size={10} />{timeAgo(article.published_at)}</span>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/article/${article.slug}`} className="block group py-3 border-b border-border/50 last:border-0">
        <div className="flex items-start gap-2">
          <span className="text-primary mt-1 shrink-0">›</span>
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
        </div>
        {article.published_at && (
          <span className="text-xs text-muted-foreground ml-4">{timeAgo(article.published_at)}</span>
        )}
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.slug}`} className="block group rounded-lg overflow-hidden gold-border card-hover bg-card">
      <div className="aspect-[16/9] overflow-hidden">
        <img src={imgSrc} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-4">
        {article.categories && (
          <span className="text-primary text-xs font-bold uppercase tracking-wide">{article.categories.name}</span>
        )}
        <h3 className="text-base font-bold text-foreground line-clamp-2 mt-1 group-hover:text-primary transition-colors">{article.title}</h3>
        {article.excerpt && <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{article.excerpt}</p>}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {article.published_at && <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(article.published_at)}</span>}
          {article.view_count != null && <span className="flex items-center gap-1"><Eye size={11} />{article.view_count.toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  );
}
