import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ScrollFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 480);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <Button
      type="button"
      size="icon"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Cuộn lên đầu trang"
      title="Cuộn lên đầu trang"
      className="fixed bottom-5 right-5 z-30 h-11 w-11 rounded-full border border-brand bg-brand text-primary-foreground shadow-lg transition-colors hover:bg-brand-dark min-[720px]:bottom-7 min-[720px]:right-7"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}