import { useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import type { Brand } from "@/types/brand";
import type { Voucher } from "@/types/voucher";
import { Button } from "@/components/ui/button";

interface VoucherRedeemModalProps {
  voucher: Voucher;
  brand: Brand | undefined;
  onClose: () => void;
}

export function VoucherRedeemModal({ voucher, brand, onClose }: VoucherRedeemModalProps) {
  const [copied, setCopied] = useState(false);
  const brandName = brand?.name ?? "Brand";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    if (!voucher.voucherCode) return;
    try {
      await navigator.clipboard.writeText(voucher.voucherCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/50 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-row border border-hairline bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-warm">
            {brandName} đã mở ở tab mới
          </p>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="text-text-muted transition-colors hover:text-text"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <h2 className="mt-2 text-lg font-semibold leading-snug text-text">{voucher.title}</h2>

        {voucher.type === "voucher" && voucher.voucherCode ? (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex h-12 flex-1 items-center justify-center rounded-chip border border-dashed border-hairline bg-surface font-mono text-base tracking-[0.15em] text-text">
              {voucher.voucherCode}
            </div>
            <Button
              type="button"
              onClick={copy}
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-chip bg-accent-warm px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-warm-dark"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Đã copy ✓" : "Copy mã"}
            </Button>
          </div>
        ) : (
          <p className="mt-4 rounded-chip bg-surface p-3 text-sm text-text-muted">
            Không cần mã — ưu đãi tự động áp dụng khi mua trên trang của {brandName}
          </p>
        )}

        <Button
          type="button"
          onClick={onClose}
          className="mt-5 h-11 w-full rounded-chip border border-brand text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          Đóng
        </Button>
      </div>
    </div>
  );
}
