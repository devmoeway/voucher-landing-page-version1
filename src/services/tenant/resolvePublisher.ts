import type { DataRepository, PublisherConfig } from "@/services/repository/types";

export const HARD_FALLBACK: PublisherConfig = {
  id: "default",
  publisherId: "default",
  publisherName: "Săn Deal",
  theme: { primary: "#0E4B4F" },
  siteName: "Săn Deal",
  headerFooterText: {},
  faqs: [],
  promoPosts: [],
  brands: [],
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error("Data request timed out")), timeoutMs);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function resolvePublisherDomain(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get("pub") || window.location.hostname;
}

export async function resolvePublisherConfig(repo: DataRepository): Promise<PublisherConfig> {
  try {
    const config = await withTimeout(repo.getPublisherConfig(resolvePublisherDomain()), 5000);
    return config ?? HARD_FALLBACK;
  } catch {
    return HARD_FALLBACK;
  }
}
