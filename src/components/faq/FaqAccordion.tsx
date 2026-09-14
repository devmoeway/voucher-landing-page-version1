import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqEntry } from "@/services/repository/types";

interface FaqAccordionProps {
  items: FaqEntry[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  if (items.length === 0) return null;

  return (
    <section id="cau-hoi-thuong-gap" className="scroll-mt-24 border-t border-hairline py-12">
      <div className="mx-auto max-w-[880px]">
        <h2 className="text-center text-2xl text-brand">Câu hỏi thường gặp</h2>
        <Accordion type="single" collapsible className="mt-7 border-t border-hairline">
          {items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="border-hairline">
              <AccordionTrigger className="py-5 text-base font-semibold text-text hover:no-underline">
                {item.title}
              </AccordionTrigger>
              <AccordionContent className="max-w-3xl pb-5 text-sm leading-relaxed text-text-muted">
                {item.description}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
