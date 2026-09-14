import type { Voucher } from "@/types/voucher";

export function isVoucherActive(voucher: Voucher): boolean {
  return typeof voucher.status === "number" && voucher.status >= 1;
}

export function shouldShowExpiry(voucher: Voucher): boolean {
  if (!voucher.expiryDate) return false;
  const date = new Date(voucher.expiryDate);
  return !Number.isNaN(date.getTime());
}

export function formatExpiry(expiryDate?: string): string {
  if (!expiryDate) return "";
  const date = new Date(expiryDate);
  if (Number.isNaN(date.getTime())) return "";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
}

export function bestDiscountPercent(vouchers: Voucher[]): number | null {
  const percents = vouchers
    .map((voucher) => voucher.discountPercent ?? null)
    .filter((n): n is number => n !== null);
  if (!percents.length) return null;
  return Math.max(...percents);
}

export function discountDisplay(voucher: Voucher): string {
  if (voucher.discountLabel) return voucher.discountLabel;
  return voucher.discountPercent !== undefined ? `${voucher.discountPercent}%` : "Deal";
}

export function discountUnitLabel(voucher: Voucher): string {
  return voucher.discountLabel || voucher.discountPercent === undefined ? "ưu đãi" : "giảm giá";
}
