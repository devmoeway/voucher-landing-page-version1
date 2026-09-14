import { Tag, Ticket } from "lucide-react";
import type { Brand } from "@/types/brand";
import type { Voucher } from "@/types/voucher";
import { BrandAvatar } from "@/components/brand/BrandAvatar";
import { VoucherCodeMasked } from "./VoucherCodeMasked";
import {
  discountDisplay,
  discountUnitLabel,
  formatExpiry,
  shouldShowExpiry,
} from "@/utils/voucherHelpers";
import { Button } from "@/components/ui/button";

interface VoucherRowProps {
  voucher: Voucher;
  brand: Brand | undefined;
  onRedeem: (voucher: Voucher) => void;
}

export function VoucherRow({ voucher, brand, onRedeem }: VoucherRowProps) {
  const hasCode = voucher.type === "voucher" && Boolean(voucher.voucherCode);
  const showExpiry = shouldShowExpiry(voucher);

  return (
    <article className="flex flex-col overflow-hidden rounded-row border border-hairline bg-white min-[620px]:flex-row">
      {/* Stub — số giảm giá */}
      <div className="flex shrink-0 items-center justify-center gap-2 bg-accent-warm px-4 py-3 text-white min-[620px]:w-[104px] min-[620px]:flex-col min-[620px]:gap-0 min-[620px]:py-5">
        <span className="font-heading text-2xl font-bold leading-none">
          {discountDisplay(voucher)}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-white/80 min-[620px]:mt-1">
          {discountUnitLabel(voucher)}
        </span>
      </div>

      {/* Đường vé xé */}
      <div className="relative hidden min-[620px]:block">
        <div className="h-full border-l border-dashed border-hairline" />
        <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white" />
        <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-white" />
      </div>

      {/* Thân */}
      <div className="min-w-0 flex-1 px-4 py-4">
        <div className="flex items-center gap-2">
          {brand ? <BrandAvatar brand={brand} size={24} /> : null}
          <span className="text-sm font-semibold text-brand">{brand?.name ?? "Brand"}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              "bg-accent-warm/10 text-accent-warm-dark"
            }`}
          >
            {hasCode ? (
              <Ticket className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Tag className="h-3 w-3" aria-hidden="true" />
            )}
            {hasCode ? "Có mã" : "Deal"}
          </span>
        </div>

        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug text-text">{voucher.title}</h3>

        {showExpiry && (
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
            {showExpiry && <span>HSD: {formatExpiry(voucher.expiryDate)}</span>}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="flex items-center px-4 pb-4 min-[620px]:w-[220px] min-[620px]:shrink-0 min-[620px]:py-4">
        {hasCode && voucher.voucherCode ? (
          <VoucherCodeMasked code={voucher.voucherCode} onReveal={() => onRedeem(voucher)} />
        ) : (
          <Button
            type="button"
            onClick={() => onRedeem(voucher)}
            className="h-11 w-full rounded-chip bg-accent-warm text-sm font-semibold text-primary-foreground shadow-none hover:bg-accent-warm-dark"
          >
            Xem ưu đãi
          </Button>
        )}
      </div>
    </article>
  );
}
