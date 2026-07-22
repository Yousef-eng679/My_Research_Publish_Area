import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filePathArray = resolvedParams.path;

    if (!filePathArray || filePathArray.length === 0) {
      return new NextResponse("Invalid file path", { status: 400 });
    }

    // Resolve the absolute path under public/uploads
    const relativePath = path.join(/*turbopackIgnore: true*/ "public", "uploads", ...filePathArray);
    const absolutePath = path.join(/*turbopackIgnore: true*/ process.cwd(), relativePath);

    // Read the file from the filesystem
    const fileBuffer = await fs.readFile(absolutePath);

    // Deduce standard Content-Type headers
    const ext = path.extname(absolutePath).toLowerCase();

    // Block serving dangerous dynamic script extensions
    if ([".html", ".htm", ".js", ".php", ".sh", ".bat", ".exe"].includes(ext)) {
      return new NextResponse("Forbidden file execution", { status: 403 });
    }

    let contentType = "application/octet-stream";
    if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".pdf") contentType = "application/pdf";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox;",
      },
    });
  } catch (err) {
    return new NextResponse("File not found", { status: 404 });
  }
}
