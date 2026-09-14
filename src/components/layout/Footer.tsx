import type { Brand } from "@/types/brand";

interface FooterProps {
  brands: Brand[];
  onSelectBrand?: ((brandId: string) => void) | undefined;
  siteName: string;
  footerText?: string | undefined;
  hasFaq: boolean;
  hasPromoPosts: boolean;
}

const DEFAULT_FOOTER_TEXT = "Nơi tổng hợp voucher và ưu đãi mới từ các brand bạn yêu thích.";

export function Footer({
  brands,
  onSelectBrand,
  siteName,
  footerText,
  hasFaq,
  hasPromoPosts,
}: FooterProps) {
  return (
    <footer className="border-t border-hairline bg-card">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-9 min-[720px]:grid-cols-[1.1fr_1.5fr_0.8fr]">
          <div id="ve-chung-toi" className="scroll-mt-24">
            <a href="#top" className="font-heading text-xl font-bold text-brand">
              {siteName}
            </a>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-muted">
              {footerText || DEFAULT_FOOTER_TEXT}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              Các liên kết ngoài là link tracking affiliate.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-bold text-text">Danh mục Brand</h2>
            <div className="mt-4 grid gap-5 min-[480px]:grid-cols-2">
              <div>
                <ul className="space-y-1.5">
                  {brands.map((brand) => (
                    <li key={brand.id}>
                      <a
                        href="#top"
                        onClick={(event) => {
                          event.preventDefault();
                          onSelectBrand?.(brand.id);
                        }}
                        className="text-sm text-text transition-colors hover:text-brand"
                      >
                        {brand.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-text">Liên kết nhanh</h2>
            <nav
              className="mt-4 flex flex-col items-start gap-2 text-sm"
              aria-label="Liên kết nhanh"
            >
              <a href="#top" className="text-text transition-colors hover:text-brand">
                Trang chủ
              </a>
              {hasPromoPosts && (
                <a href="#tin-khuyen-mai" className="text-text transition-colors hover:text-brand">
                  Tin khuyến mãi
                </a>
              )}
              {hasFaq && (
                <a
                  href="#cau-hoi-thuong-gap"
                  className="text-text transition-colors hover:text-brand"
                >
                  Câu hỏi thường gặp
                </a>
              )}
            </nav>
          </div>
        </div>

        <p className="mt-9 border-t border-hairline pt-5 text-xs text-text-muted">
          © 2026 {siteName} — Trang tổng hợp ưu đãi độc lập. Các liên kết ngoài là link tracking
          affiliate.
        </p>
      </div>
    </footer>
  );
}
