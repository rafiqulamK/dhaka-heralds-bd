import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ArticleCard from './ArticleCard';

interface AutoSliderCarouselProps {
  articles: any[];
  interval?: number;
  title?: string;
}

export default function AutoSliderCarousel({ articles, interval = 4000, title }: AutoSliderCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = articles.length;

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [paused, total, interval, next]);

  if (total === 0) return null;

  // Show 1 on mobile, 2 on sm, 3 on lg
  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {articles.map((article, i) => (
            <div
              key={article.id || i}
              className="w-full shrink-0 px-1 sm:w-1/2 lg:w-1/3"
              style={{ minWidth: '100%' }}
            >
              <ArticleCard article={article} variant="featured" />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation arrows */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
            aria-label="Next"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}

      {/* Dots */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {articles.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
