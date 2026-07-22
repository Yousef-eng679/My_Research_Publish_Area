import { sanitizeHtmlContent } from "./securityUtils";

/**
 * Validates and sanitizes text input fields (titles, summaries, descriptions).
 */
export function validateAndSanitizeText(input: string | undefined | null, maxLength = 1000): string {
  if (!input) return "";
  const trimmed = input.trim();
  const sanitized = sanitizeHtmlContent(trimmed);
  return sanitized.length > maxLength ? sanitized.substring(0, maxLength) : sanitized;
}

/**
 * Validates and formats URL-safe slugs.
 */
export function validateSlug(slug: string): string {
  if (!slug) return "";
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Sanitizes and normalizes array of topic strings.
 */
export function validateTopics(topics: string[]): string[] {
  if (!Array.isArray(topics)) return [];
  return topics
    .map((t) => validateSlug(sanitizeHtmlContent(t).replace(/<[^>]*>/g, "")))
    .filter((t) => t.length > 0);
}

/**
 * Checks if a requested admin path matches the configured secret admin path.
 */
export function isSecretAdminPathAllowed(requestedPath: string, secretPath?: string): boolean {
  if (!secretPath) return true; // Default standard path allowed
  const cleanRequested = requestedPath.replace(/^\/+|\/+$/g, "");
  const cleanSecret = secretPath.replace(/^\/+|\/+$/g, "");
  return cleanRequested === cleanSecret || cleanRequested.startsWith(cleanSecret + "/");
}
