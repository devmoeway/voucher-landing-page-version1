import { useState } from "react";
import type { Brand } from "@/types/brand";

interface BrandAvatarProps {
  brand: Brand;
  size?: number;
  variant?: "soft" | "solid";
  className?: string;
}

export function BrandAvatar({ brand, size = 20, variant = "soft", className = "" }: BrandAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(brand.logoUrl) && !failed;
  const isSolid = variant === "solid";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${
        isSolid ? "bg-brand text-primary-foreground" : "bg-brand-soft text-brand"
      } ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.45)) }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={brand.logoUrl}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        brand.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
