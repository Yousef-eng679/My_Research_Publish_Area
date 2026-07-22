/**
 * Formats a date string or Date object into a human-friendly format: "Month Day, Year"
 * to resolve date format ambiguity.
 */
export function formatFriendlyDate(dateInput: Date | string | number): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Auto-generates a URL-friendly slug from a title string.
 * Strips special characters, converts spaces to hyphens, and lowercases.
 */
export function generateSlug(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric, non-space, non-hyphen
    .replace(/\s+/g, "-")          // replace spaces with hyphens
    .replace(/-+/g, "-");          // collapse multiple hyphens
}

/**
 * Returns a progress description string for serialized books.
 */
export function getBookProgressText(publishedCount: number, totalCount: number): string {
  if (totalCount === 0) {
    return "No chapters released";
  }
  if (publishedCount === 0) {
    return `Coming Soon (${totalCount} chapters in progress)`;
  }
  if (publishedCount === totalCount) {
    return `Complete (${publishedCount} chapters)`;
  }
  return `Chapter ${publishedCount} of ${totalCount} released`;
}
