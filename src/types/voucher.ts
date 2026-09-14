export interface Voucher {
  id: string;
  brandId: string;
  title: string;
  discountPercent?: number | undefined;
  discountLabel?: string | undefined;
  type: "deal" | "voucher";
  description?: string | undefined;
  voucherCode?: string | undefined;
  expiryDate?: string | undefined;
  status: number;
}
