import path from "path";

/**
 * Sanitizes a filename to make it safe for the server filesystem and URL access.
 */
export function sanitizeFilename(filename: string): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  const cleanBase = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric
    .replace(/\s+/g, "-")          // spaces to dashes
    .replace(/-+/g, "-");          // collapse multiple dashes

  const timestamp = Date.now();
  // Ensure we keep timestamp but make it testable or just append
  return `${cleanBase}-${timestamp}${ext.toLowerCase()}`;
}

/**
 * Returns the target directory for a file upload based on its extension.
 */
export function getUploadDirectory(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".pdf") {
    return "public/uploads/pdfs";
  }
  if ([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"].includes(ext)) {
    return "public/uploads/images";
  }
  return "public/uploads/documents";
}
