import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  siteName: string;
  logoUrl?: string | undefined;
}

export function Header({ siteName, logoUrl }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: "/#danh-sach-voucher", label: "Danh sách Voucher" },
    { href: "/#tin-khuyen-mai", label: "Tin tức" },
    { href: "/#ve-chung-toi", label: "Về chúng tôi" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-card/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? <img src={logoUrl} alt="" className="h-7 w-auto" /> : null}
          <span className="font-heading text-xl font-bold tracking-tight text-brand">
            {siteName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 min-[768px]:flex" aria-label="Điều hướng chính">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => setMenuOpen((current) => !current)}
          className="text-brand hover:bg-brand-soft hover:text-brand-dark min-[768px]:hidden"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      {menuOpen ? (
        <nav className="border-t border-hairline bg-card px-4 py-3 min-[768px]:hidden" aria-label="Điều hướng mobile">
          <div className="mx-auto flex max-w-6xl flex-col">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
