import { useCallback, useEffect, useState } from "react";
import { supabaseRepository } from "@/services/repository/supabaseRepository";
import type { VoucherSort } from "@/services/repository/types";
import type { Voucher } from "@/types/voucher";

const PAGE_SIZE = 6;

export function useVouchersByBrand(
  domain: string | null,
  brandId?: string,
  sort: VoucherSort = "newest",
) {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    setPage(1);
  }, [brandId]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    if (!domain) return;
    supabaseRepository
      .getPublisherVouchers({ domain, brandId, page, limit: PAGE_SIZE, sort })
      .then((data) => {
        if (cancelled) return;
        setVouchers((current) => (page === 1 ? data.vouchers : [...current, ...data.vouchers]));
        setTotal(data.total);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [brandId, domain, page, reloadToken, sort]);

  const loadMore = useCallback(() => setPage((p) => p + 1), []);
  const retry = useCallback(() => setReloadToken((t) => t + 1), []);

  return {
    vouchers,
    total,
    isLoading,
    error,
    hasMore: vouchers.length < total,
    loadMore,
    retry,
  };
}
