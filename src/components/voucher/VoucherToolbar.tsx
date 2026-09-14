import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { VoucherSort } from "@/services/repository/types";

export type VoucherTypeFilter = "all" | "voucher" | "deal";

interface VoucherToolbarProps {
  activeType: VoucherTypeFilter;
  counts: Record<VoucherTypeFilter, number>;
  sort: VoucherSort;
  onTypeChange: (type: VoucherTypeFilter) => void;
  onSortChange: (sort: VoucherSort) => void;
}

const TYPE_TABS: Array<{ value: VoucherTypeFilter; label: string }> = [
  { value: "all", label: "Tất cả" },
  { value: "voucher", label: "Có mã" },
  { value: "deal", label: "Deal" },
];

export function VoucherToolbar({
  activeType,
  counts,
  sort,
  onTypeChange,
  onSortChange,
}: VoucherToolbarProps) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="hide-scrollbar flex min-w-0 gap-1.5 overflow-x-auto py-1 min-[480px]:gap-2" role="tablist" aria-label="Lọc loại ưu đãi">
        {TYPE_TABS.map((tab) => {
          const active = activeType === tab.value;
          return (
            <Button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              variant="outline"
              onClick={() => onTypeChange(tab.value)}
              className={`h-9 shrink-0 rounded-chip px-2 text-xs shadow-none min-[480px]:px-3 min-[480px]:text-sm ${
                active
                  ? "border-brand bg-brand text-primary-foreground hover:bg-brand-dark hover:text-primary-foreground"
                  : "border-hairline bg-white text-text hover:border-brand hover:bg-brand-soft"
              }`}
            >
              {tab.label} ({counts[tab.value]})
            </Button>
          );
        })}
      </div>

      <label className="relative shrink-0">
        <span className="sr-only">Sắp xếp ưu đãi</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as VoucherSort)}
          className="h-9 w-[116px] cursor-pointer appearance-none rounded-chip border border-hairline bg-white py-0 pl-2.5 pr-7 text-xs font-medium text-text outline-none transition-colors hover:border-brand focus:border-brand focus:ring-2 focus:ring-brand-soft min-[480px]:w-auto min-[480px]:pl-3 min-[480px]:pr-8 min-[480px]:text-sm"
          aria-label="Sắp xếp"
        >
          <option value="newest">Mới nhất</option>
          <option value="discount">Giảm cao</option>
          <option value="expiry">Hết hạn sớm</option>
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
          aria-hidden="true"
        />
      </label>
    </div>
  );
}