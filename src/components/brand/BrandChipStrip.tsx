import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Brand } from "@/types/brand";

interface BrandChipStripProps {
  brands: Brand[];
  counts: Record<string, number>;
  selectedBrandId: string | null;
  onSelect: (brandId: string | null) => void;
}

export function BrandChipStrip({ brands, counts, selectedBrandId, onSelect }: BrandChipStripProps) {
  const [expanded, setExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const visibleBrands = expanded ? brands : brands.slice(0, 10);
  const hiddenCount = Math.max(0, brands.length - 10);

  useEffect(() => {
    setExpanded(false);
  }, [brands]);

  const select = (brandId: string | null) => {
    onSelect(brandId);
    setPanelOpen(false);
  };

  const tiles = (items: Brand[]) => (
    <>
      <BrandTile
        label="Tất cả"
        count={Object.values(counts).reduce((sum, count) => sum + count, 0)}
        isAll
        active={selectedBrandId === null}
        onClick={() => select(null)}
      />
      {items.map((brand) => (
        <BrandTile
          key={brand.id}
          brand={brand}
          label={brand.name}
          count={counts[brand.id] ?? 0}
          active={selectedBrandId === brand.id}
          onClick={() => select(brand.id)}
        />
      ))}
    </>
  );

  return (
    <div>
      <Button
        type="button"
        onClick={() => setPanelOpen(true)}
        variant="outline"
        className="mx-auto flex h-11 rounded-chip border-hairline bg-card px-4 text-sm font-semibold text-brand shadow-none hover:border-brand hover:bg-brand-soft min-[768px]:hidden"
      >
        <SlidersHorizontal aria-hidden="true" />
        {selectedBrandId ? "Đổi brand" : "Lọc theo brand"}
      </Button>

      <div className="mx-auto hidden max-w-[900px] min-[768px]:block">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
          {tiles(visibleBrands)}
        </div>
        {hiddenCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setExpanded((current) => !current)}
            className="mx-auto mt-3 h-9 text-sm font-semibold text-brand hover:bg-brand-soft hover:text-brand-dark"
          >
            {expanded ? <ChevronUp /> : <ChevronDown />}
            {expanded ? "Thu gọn" : `Xem thêm ${hiddenCount} brand`}
          </Button>
        ) : null}
      </div>

      {panelOpen ? (
        <div className="fixed inset-0 z-50 bg-foreground/35 p-4 min-[768px]:hidden" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="brand-filter-title"
            className="mx-auto mt-16 max-h-[calc(100dvh-6rem)] max-w-md overflow-y-auto rounded-row border border-hairline bg-card p-4 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="brand-filter-title" className="text-lg font-bold text-text">
                Lọc theo brand
              </h2>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setPanelOpen(false)}
                aria-label="Đóng bộ lọc brand"
                className="text-brand hover:bg-brand-soft"
              >
                <X />
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3">
              {tiles(brands)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

interface BrandTileProps {
  brand?: Brand;
  label: string;
  count: number;
  isAll?: boolean;
  active: boolean;
  onClick: () => void;
}

function BrandTile({ brand, label, count, isAll = false, active, onClick }: BrandTileProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(brand?.logoUrl) && !imageFailed;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      aria-label={`${label}, ${count} ưu đãi`}
      aria-pressed={active}
      className={`group relative h-[104px] min-w-[100px] w-full overflow-hidden rounded-xl bg-card p-0 shadow-sm transition-[transform,box-shadow,border-color] duration-150 ease-out hover:scale-[1.02] hover:bg-card hover:shadow-md ${
        active
          ? "border-2 border-brand"
          : "border border-hairline hover:border-brand"
      }`}
    >
      <span className={`flex w-full items-center justify-center overflow-hidden bg-card ${isAll ? "h-[72px]" : "h-full"}`}>
        {showImage ? (
          <img
            src={brand?.logoUrl}
            alt=""
            className="h-full w-full object-contain p-2"
            onError={() => setImageFailed(true)}
          />
        ) : brand ? (
          <span className="flex h-full w-full items-center justify-center bg-brand-soft text-3xl font-bold text-brand">
            {brand.name.charAt(0).toUpperCase()}
          </span>
        ) : (
          <LayoutGrid className="h-7 w-7 text-brand [&]:size-7" aria-hidden="true" />
        )}
      </span>

      {isAll ? (
        <span className={`absolute inset-x-0 bottom-0 flex h-8 items-center justify-center border-t border-hairline px-2 text-center text-xs font-semibold text-text ${active ? "bg-brand-soft" : "bg-surface"}`}>
          Tất cả ({count})
        </span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-foreground/40 px-2 text-center text-xs font-semibold text-primary-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          {label}
        </span>
      )}
    </Button>
  );
}
