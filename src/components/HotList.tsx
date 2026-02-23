import { Link } from 'react-router-dom';
import { Flame, TrendingUp } from 'lucide-react';

interface HotListItem {
  id: string;
  title: string;
  slug: string;
  view_count?: number | null;
  categories?: { name: string; slug: string } | null;
}

interface HotListProps {
  articles: HotListItem[];
}

export default function HotList({ articles }: HotListProps) {
  const sorted = [...articles].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 8);

  const getHeatColor = (index: number) => {
    if (index === 0) return 'text-red-500 bg-red-500/10';
    if (index === 1) return 'text-orange-500 bg-orange-500/10';
    if (index === 2) return 'text-amber-500 bg-amber-500/10';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="bg-card rounded-xl gold-border p-5">
      <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
        <Flame size={16} className="text-red-500" />
        Hot List
        <TrendingUp size={14} className="text-primary ml-auto" />
      </h3>
      <div className="space-y-1">
        {sorted.map((article, i) => (
          <Link
            key={article.id}
            to={`/article/${article.slug}`}
            className="flex items-start gap-3 py-2.5 group border-b border-border/50 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
          >
            <span className={`shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${getHeatColor(i)}`}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                {article.categories && (
                  <span className="text-[10px] text-primary font-bold uppercase">{article.categories.name}</span>
                )}
                {article.view_count != null && (
                  <span className="text-[10px] text-muted-foreground">{article.view_count.toLocaleString()} reads</span>
                )}
              </div>
            </div>
            {i < 3 && <Flame size={12} className="text-red-400 shrink-0 mt-1 animate-pulse" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
