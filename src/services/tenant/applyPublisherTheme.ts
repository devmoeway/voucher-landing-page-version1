import type { PublisherTheme, ThemePalette } from "@/services/repository/types";

const PALETTES: Record<ThemePalette, { accent: string; surface: string; hairline: string }> = {
  red: {
    accent: "oklch(0.58 0.22 28)",
    surface: "oklch(0.98 0.012 25)",
    hairline: "oklch(0.91 0.025 25)",
  },
  green: {
    accent: "oklch(0.55 0.15 155)",
    surface: "oklch(0.98 0.014 155)",
    hairline: "oklch(0.91 0.025 155)",
  },
  blue: {
    accent: "oklch(0.55 0.2 255)",
    surface: "oklch(0.98 0.014 255)",
    hairline: "oklch(0.91 0.025 255)",
  },
};

function inferPalette(primary: string): ThemePalette {
  const match = /^#([0-9a-f]{6})$/i.exec(primary.trim());
  if (!match) return "green";
  const hex = match[1];
  if (!hex) return "green";

  const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
  const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  if (delta === 0) return "blue";

  let hue = 0;
  if (max === red) hue = 60 * (((green - blue) / delta) % 6);
  else if (max === green) hue = 60 * ((blue - red) / delta + 2);
  else hue = 60 * ((red - green) / delta + 4);
  if (hue < 0) hue += 360;

  if (hue < 45 || hue >= 330) return "red";
  if (hue >= 75 && hue < 175) return "green";
  return "blue";
}

export function applyPublisherTheme(theme: PublisherTheme) {
  const palette = PALETTES[theme.palette ?? inferPalette(theme.primary)];
  const root = document.documentElement;
  const primary = CSS.supports("color", theme.primary) ? theme.primary : "#0E4B4F";
  const primaryDark =
    theme.primaryDark && CSS.supports("color", theme.primaryDark)
      ? theme.primaryDark
      : `color-mix(in srgb, ${primary} 76%, black)`;
  const primaryLight =
    theme.primaryLight && CSS.supports("color", theme.primaryLight)
      ? theme.primaryLight
      : `color-mix(in srgb, ${primary} 12%, white)`;

  root.style.setProperty("--sd-brand", primary);
  root.style.setProperty("--sd-brand-dark", primaryDark);
  root.style.setProperty("--sd-brand-light", primaryLight);
  root.style.setProperty("--surface", theme.surface ?? palette.surface);
  root.style.setProperty("--hairline", theme.hairline ?? palette.hairline);
}