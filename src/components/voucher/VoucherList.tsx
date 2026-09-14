import type { Brand } from "@/types/brand";
import type { Voucher } from "@/types/voucher";
import { VoucherRow } from "./VoucherRow";

interface VoucherListProps {
  vouchers: Voucher[];
  brandsById: Record<string, Brand>;
  onRedeem: (voucher: Voucher) => void;
}

export function VoucherList({ vouchers, brandsById, onRedeem }: VoucherListProps) {
  return (
    <div className="flex flex-col gap-3">
      {vouchers.map((voucher) => (
        <VoucherRow
          key={voucher.id}
          voucher={voucher}
          brand={brandsById[voucher.brandId]}
          onRedeem={onRedeem}
        />
      ))}
    </div>
  );
}

export function VoucherListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[104px] animate-pulse-soft rounded-row border border-hairline bg-surface"
        />
      ))}
    </div>
  );
}
