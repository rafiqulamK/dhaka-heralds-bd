import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';

interface EngagementSidebarProps {
  articleTitle?: string;
  articleUrl?: string;
}

export default function EngagementSidebar({ articleTitle, articleUrl }: EngagementSidebarProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 200) + 10);
  const [bookmarked, setBookmarked] = useState(false);
  const commentCount = Math.floor(Math.random() * 50) + 3;

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: articleTitle || 'Dhaka Heralds', url: articleUrl || window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const actions = [
    { icon: Heart, label: `${likeCount}`, active: liked, onClick: handleLike, activeClass: 'text-red-500 fill-red-500' },
    { icon: MessageCircle, label: `${commentCount}`, active: false, onClick: () => {}, activeClass: '' },
    { icon: Bookmark, label: bookmarked ? 'Saved' : 'Save', active: bookmarked, onClick: () => setBookmarked(!bookmarked), activeClass: 'text-primary fill-primary' },
    { icon: Share2, label: 'Share', active: false, onClick: handleShare, activeClass: '' },
  ];

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col gap-3">
      {actions.map(({ icon: Icon, label, active, onClick, activeClass }) => (
        <button
          key={label}
          onClick={onClick}
          className={`flex flex-col items-center gap-1 p-3 rounded-full bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:scale-110 ${active ? activeClass : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
