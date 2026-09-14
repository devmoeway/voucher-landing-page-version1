import { supabase } from "./supabaseClient";
import type {
  DataRepository,
  FaqEntry,
  PromoPostEntry,
  PublisherBrand,
  PublisherConfig,
  ThemePalette,
  VoucherPage,
  VoucherQuery,
} from "./types";
import type { Voucher } from "@/types/voucher";

function asRecord<T>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : ({} as T);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function optionalPalette(value: unknown): ThemePalette | undefined {
  return value === "red" || value === "green" || value === "blue" ? value : undefined;
}

interface ContentPayload {
  id?: unknown;
  title?: unknown;
  description?: unknown;
  thumbnail_url?: unknown;
  last_updated?: unknown;
}

function mapFaq(value: unknown): FaqEntry | null {
  const row = asRecord<ContentPayload>(value);
  if (typeof row.id !== "string" || typeof row.title !== "string") return null;
  return {
    id: row.id,
    title: row.title,
    description: typeof row.description === "string" ? row.description : "",
  };
}

function mapPost(value: unknown): PromoPostEntry | null {
  const row = asRecord<ContentPayload>(value);
  if (typeof row.id !== "string" || typeof row.title !== "string") return null;
  return {
    id: row.id,
    title: row.title,
    description: typeof row.description === "string" ? row.description : "",
    thumbnailUrl: optionalString(row.thumbnail_url),
    lastUpdated: optionalString(row.last_updated),
  };
}

interface BrandPayload {
  id?: unknown;
  name?: unknown;
  logoUrl?: unknown;
  description?: unknown;
  trackingLink?: unknown;
}

function mapBrand(value: unknown): PublisherBrand | null {
  const row = asRecord<BrandPayload>(value);
  if (typeof row.id !== "string" || typeof row.name !== "string") return null;
  return {
    id: row.id,
    name: row.name,
    logoUrl: optionalString(row.logoUrl),
    description: optionalString(row.description),
    trackingLink: typeof row.trackingLink === "string" ? row.trackingLink : "",
  };
}

interface ConfigPayload {
  id?: unknown;
  publisherId?: unknown;
  publisherName?: unknown;
  theme?: unknown;
  siteName?: unknown;
  logoUrl?: unknown;
  headerFooterText?: unknown;
  faqs?: unknown;
  promoPosts?: unknown;
  brands?: unknown;
}

function mapPublisher(value: unknown): PublisherConfig | null {
  const row = asRecord<ConfigPayload>(value);
  if (typeof row.publisherId !== "string") return null;
  const theme = asRecord<{
    primary?: unknown;
    primaryDark?: unknown;
    primaryLight?: unknown;
    palette?: unknown;
    accent?: unknown;
    surface?: unknown;
    hairline?: unknown;
  }>(row.theme);
  const texts = asRecord<{ footerText?: unknown; introText?: unknown }>(row.headerFooterText);
  return {
    id: typeof row.id === "string" ? row.id : row.publisherId,
    publisherId: row.publisherId,
    publisherName: typeof row.publisherName === "string" ? row.publisherName : "Săn Deal",
    theme: {
      primary: typeof theme.primary === "string" ? theme.primary : "#0E4B4F",
      primaryDark: optionalString(theme.primaryDark),
      primaryLight: optionalString(theme.primaryLight),
      palette: optionalPalette(theme.palette),
      accent: optionalString(theme.accent),
      surface: optionalString(theme.surface),
      hairline: optionalString(theme.hairline),
    },
    siteName:
      typeof row.siteName === "string" && row.siteName.length > 0 ? row.siteName : "Săn Deal",
    logoUrl: optionalString(row.logoUrl),
    headerFooterText: {
      footerText: optionalString(texts.footerText),
      introText: optionalString(texts.introText),
    },
    faqs: Array.isArray(row.faqs)
      ? row.faqs.map(mapFaq).filter((item): item is FaqEntry => item !== null)
      : [],
    promoPosts: Array.isArray(row.promoPosts)
      ? row.promoPosts.map(mapPost).filter((item): item is PromoPostEntry => item !== null)
      : [],
    brands: Array.isArray(row.brands)
      ? row.brands.map(mapBrand).filter((item): item is PublisherBrand => item !== null)
      : [],
  };
}

interface VoucherPayload {
  id?: unknown;
  brand_id?: unknown;
  title?: unknown;
  discount_percent?: unknown;
  discount_label?: unknown;
  type?: unknown;
  expired_date?: unknown;
  description?: unknown;
  voucher_code?: unknown;
  status?: unknown;
}

function mapVoucher(value: unknown): Voucher | null {
  const row = asRecord<VoucherPayload>(value);
  if (
    typeof row.id !== "string" ||
    typeof row.brand_id !== "string" ||
    typeof row.title !== "string"
  ) {
    return null;
  }

  const discountPercent =
    typeof row.discount_percent === "number"
      ? row.discount_percent
      : typeof row.discount_percent === "string"
        ? Number(row.discount_percent)
        : undefined;

  return {
    id: row.id,
    brandId: row.brand_id,
    title: row.title,
    discountPercent:
      typeof discountPercent === "number" && Number.isFinite(discountPercent)
        ? discountPercent
        : undefined,
    discountLabel: optionalString(row.discount_label),
    type: row.type === "deal" ? "deal" : "voucher",
    expiryDate: optionalString(row.expired_date),
    description: optionalString(row.description),
    voucherCode: optionalString(row.voucher_code),
    status: typeof row.status === "number" ? row.status : 0,
  };
}

interface VoucherPagePayload {
  vouchers?: unknown;
  total?: unknown;
  page?: unknown;
  limit?: unknown;
}

export const supabaseRepository: DataRepository = {
  async getPublisherConfig(domain) {
    const { data, error } = await supabase.rpc("get_publisher_config", { p_domain: domain });
    if (error) throw error;
    return mapPublisher(data);
  },

  async getPublisherVouchers({
    domain,
    brandId,
    page = 1,
    limit = 20,
    sort = "newest",
  }: VoucherQuery): Promise<VoucherPage> {
    const rpcParams = {
      p_domain: domain,
      p_page: page,
      p_limit: limit,
      p_sort: sort,
      ...(brandId ? { p_brand_id: brandId } : {}),
    };
    const { data, error } = await supabase.rpc("get_publisher_vouchers", rpcParams);
    if (error) throw error;
    const result = asRecord<VoucherPagePayload>(data);
    const vouchers = Array.isArray(result.vouchers)
      ? result.vouchers.map(mapVoucher).filter((voucher): voucher is Voucher => voucher !== null)
      : [];
    return {
      vouchers,
      total: typeof result.total === "number" ? result.total : 0,
      page: typeof result.page === "number" ? result.page : page,
      limit: typeof result.limit === "number" ? result.limit : limit,
    };
  },
};
