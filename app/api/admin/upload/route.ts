import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { sanitizeFilename, getUploadDirectory } from "@/lib/upload";
import { isAllowedExtension, validateFileBuffer } from "@/lib/uploadSecurity";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  // Authorize - only authenticated admin can upload files
  const cookieStore = await cookies();
  if (!cookieStore.has("admin_session")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalName = file.name;
    if (!isAllowedExtension(originalName)) {
      return NextResponse.json(
        { error: "Forbidden file type. Only PDFs and standard images (.png, .jpg, .webp, .svg) are allowed." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(originalName).toLowerCase().replace(".", "");
    const maxSizeBytes = ext === "pdf" ? 15 * 1024 * 1024 : 5 * 1024 * 1024;
    const validation = validateFileBuffer(buffer, ext, maxSizeBytes);

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const sanitizedName = sanitizeFilename(originalName);
    const relativeDir = getUploadDirectory(sanitizedName);
    
    // Ensure the folder exists inside the workspace public/ uploads directory
    const absoluteDir = path.join(/*turbopackIgnore: true*/ process.cwd(), relativeDir);
    await mkdir(absoluteDir, { recursive: true });

    // Write file to filesystem
    const absolutePath = path.join(/*turbopackIgnore: true*/ absoluteDir, sanitizedName);
    await writeFile(absolutePath, buffer);

    // Format the serving public path (stripping public/ prefix)
    const publicPathPrefix = relativeDir.startsWith("public/")
      ? relativeDir.substring("public/".length)
      : relativeDir;
    const publicUrl = `/${publicPathPrefix}/${sanitizedName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
