import { maskCode } from "@/utils/maskCode";
import { Button } from "@/components/ui/button";

interface VoucherCodeMaskedProps {
  code: string;
  onReveal: () => void;
}

export function VoucherCodeMasked({ code, onReveal }: VoucherCodeMaskedProps) {
  return (
    <div className="relative h-11 w-full min-w-[168px]">
      <div className="flex h-full items-center rounded-chip border border-dashed border-hairline bg-white pl-3 pr-[62%]">
        <span className="truncate font-mono text-sm tracking-wider text-text">
          {maskCode(code)}
        </span>
      </div>
      <Button
        type="button"
        onClick={onReveal}
        className="absolute right-0 top-0 h-full w-[60%] rounded-chip bg-accent-warm text-sm font-semibold text-primary-foreground shadow-none hover:bg-accent-warm-dark"
      >
        Lấy mã
      </Button>
    </div>
  );
}
