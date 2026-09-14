import { createFileRoute } from "@tanstack/react-router";
import { PromoPostPage } from "@/pages/PromoPostPage";

const title = "Tin khuyến mãi — Săn Deal";
const description =
  "Bài viết tổng hợp mã giảm giá, ưu đãi và mẹo săn deal mới nhất từ các brand yêu thích.";

export const Route = createFileRoute("/tin-khuyen-mai/$id")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PromoPostPage,
});
