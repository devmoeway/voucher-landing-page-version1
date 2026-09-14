import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollFab } from "@/components/layout/ScrollFab";
import { HowToUse } from "@/components/home/HowToUse";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { BrandChipStrip } from "@/components/brand/BrandChipStrip";
import { BrandSearchBar } from "@/components/brand/BrandSearchBar";
import { PromoPostGrid } from "@/components/promo/PromoPostGrid";
import { FaqAccordion } from "@/components/faq/FaqAccordion";
import { Button } from "@/components/ui/button";
import { VoucherList, VoucherListSkeleton } from "@/components/voucher/VoucherList";
import { VoucherRedeemModal } from "@/components/voucher/VoucherRedeemModal";
import {
  VoucherToolbar,
  type VoucherTypeFilter,
} from "@/components/voucher/VoucherToolbar";
import { useVouchersByBrand } from "@/hooks/useVouchersByBrand";
import { supabaseRepository } from "@/services/repository/supabaseRepository";
import type { PublisherConfig, VoucherSort } from "@/services/repository/types";
import { resolvePublisherConfig, resolvePublisherDomain } from "@/services/tenant/resolvePublisher";
import { applyPublisherTheme } from "@/services/tenant/applyPublisherTheme";
import type { Brand } from "@/types/brand";
import type { Voucher } from "@/types/voucher";
import { bestDiscountPercent } from "@/utils/voucherHelpers";

const MONTHS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export function HomePage() {
  const { brand: initialBrandId } = useSearch({ from: "/" });
  const [search, setSearch] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialBrandId ?? null);
  const [voucherType, setVoucherType] = useState<VoucherTypeFilter>("all");
  const [sort, setSort] = useState<VoucherSort>("newest");
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
  const [publisher, setPublisher] = useState<PublisherConfig | null>(null);
  const [publisherDomain, setPublisherDomain] = useState<string | null>(null);

  const { vouchers, isLoading, error, hasMore, loadMore, retry } = useVouchersByBrand(
    publisherDomain,
    selectedBrandId ?? undefined,
    sort,
  );

  const brands = useMemo<Brand[]>(
    () =>
      publisher?.brands.map((brand) => ({
        ...brand,
        category: brand.description,
      })) ?? [],
    [publisher],
  );

  useEffect(() => {
    let cancelled = false;
    resolvePublisherConfig(supabaseRepository).then((config) => {
      if (cancelled) return;
      setPublisher(config);
      setPublisherDomain(resolvePublisherDomain());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!publisherDomain) return;
    let cancelled = false;
    supabaseRepository
      .getPublisherVouchers({ domain: publisherDomain, limit: 999 })
      .then(({ vouchers: allVouchers }) => {
        if (cancelled) return;
        const next: Record<string, number> = {};
        for (const voucher of allVouchers) {
          next[voucher.brandId] = (next[voucher.brandId] ?? 0) + 1;
        }
        setAllVouchers(allVouchers);
        setCounts(next);
      })
      .catch(() => {
        setAllVouchers([]);
        setCounts({});
      });
    return () => {
      cancelled = true;
    };
  }, [publisherDomain]);

  useEffect(() => {
    if (!publisher) return;
    applyPublisherTheme(publisher.theme);
  }, [publisher]);

  const brandsById = useMemo(() => Object.fromEntries(brands.map((b) => [b.id, b])), [brands]);

  useEffect(() => {
    if (!initialBrandId || brands.length === 0) return;
    setSelectedBrandId(brandsById[initialBrandId] ? initialBrandId : null);
  }, [brands.length, brandsById, initialBrandId]);

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter(
      (b) => b.name.toLowerCase().includes(q) || (b.category ?? "").toLowerCase().includes(q),
    );
  }, [brands, search]);

  const selectedBrand = selectedBrandId ? brandsById[selectedBrandId] : undefined;

  const scopedVouchers = useMemo(() => {
    const source = allVouchers.length > 0 ? allVouchers : vouchers;
    if (selectedBrandId) return source.filter((voucher) => voucher.brandId === selectedBrandId);
    const allowed = new Set(filteredBrands.map((b) => b.id));
    return source.filter((voucher) => allowed.has(voucher.brandId));
  }, [allVouchers, vouchers, filteredBrands, selectedBrandId]);

  const sortedVouchers = useMemo(() => {
    const next = [...scopedVouchers];
    if (sort === "discount") {
      return next.sort((a, b) => (b.discountPercent ?? -1) - (a.discountPercent ?? -1));
    }
    if (sort === "expiry") {
      return next.sort((a, b) => {
        const aTime = a.expiryDate ? new Date(a.expiryDate).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.expiryDate ? new Date(b.expiryDate).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
      });
    }
    return next;
  }, [scopedVouchers, sort]);

  const typeCounts = useMemo(
    () => ({
      all: sortedVouchers.length,
      voucher: sortedVouchers.filter((voucher) => voucher.type === "voucher").length,
      deal: sortedVouchers.filter((voucher) => voucher.type === "deal").length,
    }),
    [sortedVouchers],
  );

  const filteredVouchers = useMemo(() => {
    const matching =
      voucherType === "all"
        ? sortedVouchers
        : sortedVouchers.filter((voucher) => voucher.type === voucherType);
    return matching.slice(0, Math.max(vouchers.length, 6));
  }, [sortedVouchers, voucherType, vouchers.length]);

  const best = bestDiscountPercent(scopedVouchers);
  const canLoadMore = hasMore && filteredVouchers.length < typeCounts[voucherType];
  const now = new Date();

  const clearAll = () => {
    setSearch("");
    setSelectedBrandId(null);
  };

  const selectBrand = (brandId: string) => {
    setSelectedBrandId(brandId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const redeem = (voucher: Voucher) => {
    const brand = brandsById[voucher.brandId];
    if (brand?.trackingLink) window.open(brand.trackingLink, "_blank", "noopener");
    setActiveVoucher(voucher);
  };

  if (!publisher) {
    return (
      <div className="min-h-screen bg-white" aria-label="Đang tải dữ liệu">
        <div className="h-16 animate-pulse-soft border-b border-hairline bg-surface" />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="mx-auto h-48 max-w-[880px] animate-pulse-soft rounded-row bg-surface" />
          <div className="mx-auto mt-8 max-w-[880px]">
            <VoucherListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="top" className="min-h-screen bg-white">
      <Header siteName={publisher.siteName} logoUrl={publisher.logoUrl} />

      {/* Hero nhỏ */}
      <section className="home-hero-gradient">
        <div className="mx-auto max-w-6xl px-4 pb-0 pt-9 text-center min-[720px]:pt-12">
          <div
            className={`mx-auto min-w-0 ${
              selectedBrand ? "max-w-[880px] rounded-row bg-brand-soft px-5 py-6" : ""
            }`}
          >
            <h1 className="font-heading text-2xl leading-tight text-text min-[720px]:text-3xl">
              {selectedBrand
                ? `Mã giảm giá ${selectedBrand.name}`
                : "Mã giảm giá cập nhật mỗi ngày"}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              {selectedBrand
                ? `${selectedBrand.category ?? "Ưu đãi"} · cập nhật tháng ${MONTHS[now.getMonth()]}`
                : "Kiểm tra mỗi sáng · Chỉ 1 chạm tới trang bán hàng"}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className={`rounded-chip px-3 py-1.5 text-xs font-medium text-text ${selectedBrand ? "bg-page" : "bg-surface"}`}>
                {typeCounts.all} ưu đãi đang hoạt động
              </span>
              {best !== null && (
                <span className="rounded-chip bg-accent-warm px-3 py-1.5 text-xs font-semibold text-primary-foreground">
                  Giảm tới {best}%
                </span>
              )}
            </div>
            {publisher.headerFooterText.introText ? (
              <div
                className="intro-rich mx-auto mt-3 max-w-[560px] text-sm leading-relaxed text-text-muted"
                dangerouslySetInnerHTML={{ __html: publisher.headerFooterText.introText }}
              />
            ) : null}
          </div>

          <div className="mt-8">
            <div className="mx-auto max-w-[640px]">
              <BrandSearchBar value={search} onChange={setSearch} />
            </div>

            {search || selectedBrandId ? (
              <Button
                type="button"
                variant="link"
                onClick={clearAll}
                className="mt-2 h-auto px-2 py-1 text-xs font-medium text-text-muted hover:text-brand"
              >
                Xoá tìm kiếm
              </Button>
            ) : null}

            <div className={search || selectedBrandId ? "mt-2" : "mt-4"}>
            <BrandChipStrip
              brands={filteredBrands}
              counts={counts}
              selectedBrandId={selectedBrandId}
              onSelect={setSelectedBrandId}
            />
            </div>
          </div>

        </div>
      </section>

      <main className="bg-page">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10">
        <div className="grid items-start gap-7 min-[900px]:grid-cols-[minmax(0,2.1fr)_minmax(280px,1fr)]">
          <section id="danh-sach-voucher" className="min-w-0 scroll-mt-24" aria-label="Danh sách ưu đãi">
            <VoucherToolbar
              activeType={voucherType}
              counts={typeCounts}
              sort={sort}
              onTypeChange={setVoucherType}
              onSortChange={setSort}
            />

            {isLoading ? (
              <VoucherListSkeleton />
            ) : error ? (
              <div className="rounded-row border border-hairline bg-surface p-8 text-center">
                <h2 className="text-lg font-semibold text-text">Không tải được ưu đãi</h2>
                <Button
                  type="button"
                  onClick={retry}
                  className="mt-4 h-10 rounded-chip bg-accent-warm px-4 text-sm font-semibold text-primary-foreground shadow-none hover:bg-accent-warm-dark"
                >
                  Thử lại
                </Button>
              </div>
            ) : filteredVouchers.length === 0 ? (
              <div className="rounded-row border border-hairline bg-surface p-8 text-center">
                <h2 className="text-lg font-semibold text-text">Chưa có ưu đãi nào ở đây</h2>
                <p className="mt-2 text-sm text-text-muted">
                  Dữ liệu được cập nhật mỗi sáng, quay lại sau nhé
                </p>
                <Button
                  type="button"
                  onClick={clearAll}
                  variant="outline"
                  className="mt-4 h-10 rounded-chip border-brand px-4 text-sm font-semibold text-brand shadow-none hover:bg-brand hover:text-primary-foreground"
                >
                  Xem tất cả brand
                </Button>
              </div>
            ) : (
              <>
                <VoucherList vouchers={filteredVouchers} brandsById={brandsById} onRedeem={redeem} />
                {canLoadMore && (
                  <div className="mt-5 text-center">
                    <Button
                      type="button"
                      onClick={loadMore}
                      variant="outline"
                      className="h-11 rounded-chip border-brand px-5 text-sm font-semibold text-brand shadow-none hover:bg-brand hover:text-primary-foreground"
                    >
                      Xem thêm ưu đãi
                    </Button>
                    <p className="mt-2 text-xs text-text-muted">
                      Đang hiện {filteredVouchers.length}/{typeCounts[voucherType]}
                    </p>
                  </div>
                )}
              </>
            )}
          </section>

          <aside className="grid gap-4 min-[900px]:sticky min-[900px]:top-6" aria-label="Hướng dẫn và thông tin brand">
            {selectedBrand ? (
              <section className="rounded-row border border-hairline bg-card p-5 text-center">
                <BrandAvatar brand={selectedBrand} size={68} variant="solid" className="mx-auto" />
                <h2 className="mt-4 font-heading text-xl font-semibold text-text">
                  {selectedBrand.name}
                </h2>
                {selectedBrand.description?.trim() ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                    {selectedBrand.description}
                  </p>
                ) : null}
                <a
                  href={selectedBrand.trackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-chip border border-brand-dark px-3.5 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-dark hover:text-primary-foreground"
                >
                  Đến {selectedBrand.name}
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </section>
            ) : null}
            <HowToUse />
          </aside>
        </div>

        <PromoPostGrid posts={publisher.promoPosts} />
        <FaqAccordion items={publisher.faqs} />
        </div>
      </main>

      <Footer
        brands={brands}
        onSelectBrand={selectBrand}
        siteName={publisher.siteName}
        footerText={publisher.headerFooterText.footerText}
        hasFaq={publisher.faqs.length > 0}
        hasPromoPosts={publisher.promoPosts.length > 0}
      />

      {activeVoucher && (
        <VoucherRedeemModal
          voucher={activeVoucher}
          brand={brandsById[activeVoucher.brandId]}
          onClose={() => setActiveVoucher(null)}
        />
      )}
      <ScrollFab />
    </div>
  );
}
