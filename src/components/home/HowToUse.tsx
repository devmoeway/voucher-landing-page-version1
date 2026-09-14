import { BadgePercent, CheckCircle2, ClipboardCopy, ExternalLink } from "lucide-react";

const STEPS = [
  { icon: ExternalLink, text: "Bấm Lấy mã/Xem ưu đãi" },
  { icon: ClipboardCopy, text: "Copy mã (nếu có)" },
  { icon: BadgePercent, text: "Dán mã lúc thanh toán trên trang brand" },
  { icon: CheckCircle2, text: "Nhận ưu đãi" },
];

export function HowToUse() {
  return (
    <section
      className="rounded-row border border-hairline bg-card p-5"
      aria-labelledby="how-to-use-title"
    >
      <h2 id="how-to-use-title" className="text-lg font-bold text-brand">
        Cách sử dụng
      </h2>
      <ol className="mt-4 grid gap-3">
        {STEPS.map(({ icon: Icon, text }, index) => (
          <li
            key={text}
            className="flex min-h-14 items-center gap-3 rounded-row bg-brand-soft px-3.5 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-primary-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm leading-snug text-text">
              <span className="mr-1 font-semibold text-brand-dark">{index + 1}.</span>
              {text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}