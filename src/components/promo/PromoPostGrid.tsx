import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PromoPostEntry } from "@/services/repository/types";
import { postExcerpt } from "@/utils/richText";

interface PromoPostGridProps {
  posts: PromoPostEntry[];
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function PromoPostGrid({ posts }: PromoPostGridProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    setCanScrollLeft(carousel.scrollLeft > 2);
    setCanScrollRight(carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    updateScrollState();
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(carousel);
    return () => resizeObserver.disconnect();
  }, [posts.length, updateScrollState]);

  const scroll = (direction: -1 | 1) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: direction * carousel.clientWidth, behavior: "smooth" });
  };

  if (posts.length === 0) return null;

  return (
    <section id="tin-khuyen-mai" className="scroll-mt-24 border-t border-hairline py-12">
      <h2 className="text-center text-2xl text-brand">Tin khuyến mãi mới nhất</h2>
      <div className="relative mt-7">
        {canScrollLeft ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => scroll(-1)}
            className="absolute -left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border-hairline bg-card text-brand shadow-sm hover:bg-card hover:text-brand-dark min-[900px]:inline-flex"
            aria-label="Xem các bài trước"
          >
            <ChevronLeft />
          </Button>
        ) : null}
        <div
          ref={carouselRef}
          onScroll={updateScrollState}
          className="hide-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain"
        >
        {posts.map((post) => (
          <article
            key={post.id}
            className="min-w-0 shrink-0 basis-[87%] snap-start min-[600px]:basis-[48%] min-[900px]:basis-[calc((100%-2.5rem)/3)]"
          >
            <Link
              to="/tin-khuyen-mai/$id"
              params={{ id: post.id }}
              className="group block rounded-row focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label={`Đọc bài: ${post.title}`}
            >
              <div className="aspect-video overflow-hidden rounded-row bg-brand-soft">
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
                  />
                ) : (
                  <span
                    className="flex h-full items-center justify-center text-brand"
                    aria-hidden="true"
                  >
                    <Newspaper className="h-8 w-8" />
                  </span>
                )}
              </div>
              {post.lastUpdated ? (
                <time dateTime={post.lastUpdated} className="mt-3 block text-xs text-text-muted">
                  {dateFormatter.format(new Date(post.lastUpdated))}
                </time>
              ) : null}
              <h3 className="mt-1 line-clamp-2 text-base font-bold leading-snug text-text transition-colors group-hover:text-brand">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-muted">
                {postExcerpt(post.description)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:text-brand-dark">
                Đọc thêm <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </article>
        ))}
        </div>
        {canScrollRight ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={() => scroll(1)}
            className="absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border-hairline bg-card text-brand shadow-sm hover:bg-card hover:text-brand-dark min-[900px]:inline-flex"
            aria-label="Xem các bài tiếp theo"
          >
            <ChevronRight />
          </Button>
        ) : null}
      </div>
    </section>
  );
}
