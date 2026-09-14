import { Search } from "lucide-react";
import { useEffect, useState } from "react";

interface BrandSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function BrandSearchBar({ value, onChange }: BrandSearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (draft === value) return;
    const timer = setTimeout(() => onChange(draft), 200);
    return () => clearTimeout(timer);
  }, [draft, value, onChange]);

  return (
    <label className="relative flex w-full items-center">
      <Search className="pointer-events-none absolute left-4 h-5 w-5 text-brand" />
      <input
        type="search"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Tìm brand — Shopee, Grab, Tiki…"
        aria-label="Tìm brand"
        className="h-[52px] w-full rounded-row border border-hairline bg-white pl-12 pr-4 text-base text-text shadow-sm outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand-soft"
      />
    </label>
  );
}
