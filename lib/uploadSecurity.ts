import path from "path";

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".svg",
]);

/**
 * Checks if the extension is in the security whitelist.
 */
export function isAllowedExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext);
}

/**
 * Validates a file buffer for binary file signature (magic numbers) and max file size.
 */
export function validateFileBuffer(
  buffer: Buffer,
  declaredType: string,
  maxSizeBytes = 15 * 1024 * 1024
): { valid: boolean; error?: string } {
  if (buffer.length > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of ${maxMb}MB.`,
    };
  }

  if (buffer.length < 4) {
    return { valid: false, error: "File buffer is corrupted or empty." };
  }

  const normType = declaredType.toLowerCase().replace(".", "");

  // Magic Number checks
  if (normType === "pdf") {
    // %PDF- magic bytes: 0x25 0x50 0x44 0x46
    const isPdf =
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;

    if (!isPdf) {
      return {
        valid: false,
        error: "Invalid file signature. File is not a valid PDF document.",
      };
    }
  } else if (normType === "png") {
    // PNG magic bytes: \x89PNG
    const isPng =
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47;

    if (!isPng) {
      return {
        valid: false,
        error: "Invalid file signature. File is not a valid PNG image.",
      };
    }
  } else if (normType === "jpg" || normType === "jpeg") {
    // JPEG magic bytes: 0xFF 0xD8 0xFF
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

    if (!isJpeg) {
      return {
        valid: false,
        error: "Invalid file signature. File is not a valid JPEG image.",
      };
    }
  }

  return { valid: true };
}
