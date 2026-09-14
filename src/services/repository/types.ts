import type { Voucher } from "@/types/voucher";

export interface PublisherBrand {
  id: string;
  name: string;
  logoUrl?: string | undefined;
  description?: string | undefined;
  trackingLink: string;
}

export interface FaqEntry {
  id: string;
  title: string;
  description: string;
}

export interface PromoPostEntry {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string | undefined;
  lastUpdated?: string | undefined;
}

export type ThemePalette = "red" | "green" | "blue";

export interface PublisherTheme {
  primary: string;
  primaryDark?: string | undefined;
  primaryLight?: string | undefined;
  palette?: ThemePalette | undefined;
  accent?: string | undefined;
  surface?: string | undefined;
  hairline?: string | undefined;
}

export interface PublisherConfig {
  id: string;
  publisherId: string;
  publisherName: string;
  theme: PublisherTheme;
  siteName: string;
  logoUrl?: string | undefined;
  headerFooterText: { footerText?: string | undefined; introText?: string | undefined };
  faqs: FaqEntry[];
  promoPosts: PromoPostEntry[];
  brands: PublisherBrand[];
}

export type VoucherSort = "newest" | "discount" | "expiry";

export interface VoucherPage {
  vouchers: Voucher[];
  total: number;
  page: number;
  limit: number;
}

export interface VoucherQuery {
  domain: string;
  brandId?: string | undefined;
  page?: number;
  limit?: number;
  sort?: VoucherSort;
}

export interface DataRepository {
  getPublisherConfig(domain: string): Promise<PublisherConfig | null>;
  getPublisherVouchers(query: VoucherQuery): Promise<VoucherPage>;
}
