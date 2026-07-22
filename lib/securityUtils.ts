/**
 * Sanitizes HTML content by stripping dangerous tags, inline event handlers,
 * and malicious protocol schemes (javascript:).
 */
export function sanitizeHtmlContent(rawHtml: string): string {
  if (!rawHtml) return "";

  return rawHtml
    // Strip <script> tags and contents
    .replace(/<script\b[^<]*([\s\S]*?)<\/script>/gi, "")
    // Strip <iframe> tags and contents
    .replace(/<iframe\b[^<]*([\s\S]*?)<\/iframe>/gi, "")
    // Strip inline event handlers (onerror=, onload=, onclick=, etc.)
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // Neutralize javascript: protocols inside attributes
    .replace(/(href|src|action)\s*=\s*(["'])?\s*javascript:[^"'>\s]*/gi, '$1="#"')
    .replace(/javascript:/gi, "no-javascript:");
}

/**
 * HTML-encodes user input strings for safe UI reflection (e.g. search terms).
 */
export function escapeSearchQuery(unsafe: string): string {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
