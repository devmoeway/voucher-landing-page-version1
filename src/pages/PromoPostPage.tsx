import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Newspaper } from "lucide-react";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabaseRepository } from "@/services/repository/supabaseRepository";
import type { PublisherConfig } from "@/services/repository/types";
import { resolvePublisherConfig } from "@/services/tenant/resolvePublisher";
import { applyPublisherTheme } from "@/services/tenant/applyPublisherTheme";
import type { Brand } from "@/types/brand";

export function PromoPostPage() {
  const { id } = useParams({ from: "/tin-khuyen-mai/$id" });
  const [publisher, setPublisher] = useState<PublisherConfig | null>(null);

  useEffect(() => {
    let cancelled = false;
    resolvePublisherConfig(supabaseRepository).then((config) => {
      if (!cancelled) setPublisher(config);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!publisher) return;
    applyPublisherTheme(publisher.theme);
  }, [publisher]);

  if (!publisher) {
    return (
      <div className="min-h-screen bg-white" aria-label="Đang tải bài viết">
        <div className="h-16 animate-pulse-soft border-b border-hairline bg-surface" />
        <div className="mx-auto max-w-[760px] px-4 py-10">
          <div className="h-64 animate-pulse-soft rounded-row bg-surface" />
        </div>
      </div>
    );
  }

  const post = publisher.promoPosts.find((item) => item.id === id);
  const brands: Brand[] = publisher.brands.map((brand) => ({
    ...brand,
    category: brand.description,
  }));
  const relatedPosts = publisher.promoPosts.filter((item) => item.id !== id).slice(0, 4);

  return (
    <div id="top" className="min-h-screen bg-white">
      <Header siteName={publisher.siteName} logoUrl={publisher.logoUrl} />

      <main className="bg-page">
        <div className="mx-auto grid max-w-6xl items-start gap-7 px-4 py-10 min-[900px]:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
          <div className="min-w-0">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại
            </Link>

            {post ? (
              <article className="mx-auto mt-6 max-w-[760px] overflow-hidden">
                <h1 className="font-heading text-2xl leading-tight text-text min-[720px]:text-3xl">
                  {post.title}
                </h1>
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt=""
                    className="mt-6 h-auto max-w-full rounded-row object-cover"
                    loading="lazy"
                  />
                ) : null}
                <div
                  className="post-content mx-auto mt-6 max-w-[760px] text-[15px] leading-relaxed text-text"
                  dangerouslySetInnerHTML={{ __html: post.description }}
                />
              </article>
            ) : (
              <div className="mt-8 rounded-row border border-hairline bg-card p-8 text-center">
                <h1 className="text-lg font-semibold text-text">Không tìm thấy bài viết</h1>
                <p className="mt-2 text-sm text-text-muted">
                  Bài viết có thể đã bị gỡ hoặc không thuộc trang này.
                </p>
              </div>
            )}
          </div>

          <aside className="grid gap-4 min-[900px]:sticky min-[900px]:top-24" aria-label="Thông tin bổ sung">
            <section className="rounded-row border border-hairline bg-card p-5">
              <h2 className="text-base font-semibold text-text">Quay lại ưu đãi</h2>
              <Button asChild className="mt-4 h-11 w-full rounded-chip bg-accent-warm text-sm font-semibold text-primary-foreground shadow-none hover:bg-accent-warm-dark">
                <Link to="/"><ArrowLeft /> Xem tất cả voucher</Link>
              </Button>
            </section>

            {brands.length > 0 ? (
              <section className="rounded-row border border-hairline bg-card p-5">
                <h2 className="text-base font-semibold text-text">Brand nổi bật</h2>
                <ul className="mt-3 grid gap-1">
                  {brands.slice(0, 6).map((brand) => (
                    <li key={brand.id}>
                      <Link
                        to="/"
                        search={{ brand: brand.id }}
                        className="flex items-center gap-3 rounded-chip px-2 py-2 text-sm font-semibold text-text transition-colors hover:bg-brand-soft hover:text-brand"
                      >
                        <BrandAvatar brand={brand} size={32} />
                        <span className="min-w-0 truncate">{brand.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {relatedPosts.length > 0 ? (
              <section className="rounded-row border border-hairline bg-card p-5">
                <h2 className="text-base font-semibold text-text">Bài viết khác</h2>
                <div className="mt-4 grid gap-4">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      to="/tin-khuyen-mai/$id"
                      params={{ id: relatedPost.id }}
                      className="group flex min-w-0 gap-3"
                    >
                      <span className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-row bg-brand-soft text-brand">
                        {relatedPost.thumbnailUrl ? (
                          <img src={relatedPost.thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          <Newspaper className="h-5 w-5" />
                        )}
                      </span>
                      <span className="line-clamp-3 text-sm font-semibold leading-snug text-text transition-colors group-hover:text-brand">
                        {relatedPost.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </aside>
        </div>
      </main>

      <Footer
        brands={brands}
        siteName={publisher.siteName}
        footerText={publisher.headerFooterText.footerText}
        hasFaq={publisher.faqs.length > 0}
        hasPromoPosts={publisher.promoPosts.length > 0}
      />
    </div>
  );
}
