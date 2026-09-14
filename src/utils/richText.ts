export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function postExcerpt(html: string, maxLength = 160): string {
  const text = stripHtml(html);
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
