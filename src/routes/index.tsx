import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { HomePage } from "@/pages/HomePage";

const title = "Săn Deal — Mã giảm giá & voucher cập nhật mỗi ngày";
const description =
  "Tổng hợp mã giảm giá, voucher và ưu đãi từ Shopee, Lazada, Grab, Tiki và nhiều brand khác. Cập nhật mỗi sáng, chỉ 1 chạm là tới trang bán hàng.";

export const Route = createFileRoute("/")({
  validateSearch: z.object({
    brand: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HomePage,
});
