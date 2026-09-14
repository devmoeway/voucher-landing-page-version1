/** Che nửa sau của mã: "SALE35OFF" -> "SALE3••••" */
export function maskCode(code: string): string {
  if (!code) return "";
  const visible = Math.ceil(code.length / 2);
  return code.slice(0, visible) + "•".repeat(Math.max(code.length - visible, 3));
}
