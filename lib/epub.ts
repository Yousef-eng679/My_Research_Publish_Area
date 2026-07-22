import JSZip from "jszip";
import { compileMarkdown } from "./markdown";

interface EpubChapterInput {
  title: string;
  body: string;
  orderIndex: number;
}

interface EpubBookInput {
  title: string;
  author: string;
  description: string;
  chapters: EpubChapterInput[];
}

/**
 * Helper to escape special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

/**
 * Generates a valid EPUB 3 in-memory ZIP buffer using JSZip
 */
export async function generateEpub(book: EpubBookInput): Promise<Buffer> {
  const zip = new JSZip();
  const modifiedDate = new Date().toISOString().replace(/\.\d+Z$/, "Z"); // YYYY-MM-DDTHH:MM:SSZ
  const bookId = `epub-gen-${Math.random().toString(36).substr(2, 9)}`;

  // 1. mimetype (MUST be first file, uncompressed/stored)
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8" ?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`.trim();
  zip.file("META-INF/container.xml", containerXml);

  // Sort chapters
  const sortedChapters = [...book.chapters].sort((a, b) => a.orderIndex - b.orderIndex);

  // Generate Manifest and Spine XML tags
  let manifestItems = "";
  let spineItems = "";
  let navItems = "";

  sortedChapters.forEach((ch, idx) => {
    const fileId = `chapter_${idx + 1}`;
    const fileName = `${fileId}.xhtml`;

    manifestItems += `    <item id="${fileId}" href="${fileName}" media-type="application/xhtml+xml"/>\n`;
    spineItems += `    <itemref idref="${fileId}"/>\n`;
    navItems += `          <li><a href="${fileName}">${escapeXml(ch.title)}</a></li>\n`;

    // Compile chapter markdown to HTML and wrap it in valid XHTML
    const bodyHtml = compileMarkdown(ch.body);
    const chapterXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>${escapeXml(ch.title)}</title>
    <meta charset="utf-8" />
    <style>
      body { font-family: sans-serif; line-height: 1.5; padding: 2% 5%; }
      h1 { text-align: center; margin-top: 10%; margin-bottom: 5%; }
      p { margin-bottom: 1em; text-indent: 1.5em; }
    </style>
  </head>
  <body>
    <section>
      <h1>${escapeXml(ch.title)}</h1>
      ${bodyHtml}
    </section>
  </body>
</html>`.trim();

    zip.file(`OEBPS/${fileName}`, chapterXhtml);
  });

  // 3. OEBPS/nav.xhtml (EPUB 3 Table of Contents)
  const navXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
  <head>
    <title>Table of Contents</title>
    <meta charset="utf-8" />
  </head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>Table of Contents</h1>
      <ol>
${navItems}      </ol>
    </nav>
  </body>
</html>`.trim();
  zip.file("OEBPS/nav.xhtml", navXhtml);

  // 4. OEBPS/content.opf
  const opfXml = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${escapeXml(book.title)}</dc:title>
    <dc:creator>${escapeXml(book.author)}</dc:creator>
    <dc:identifier id="BookID">urn:uuid:${bookId}</dc:identifier>
    <dc:language>en</dc:language>
    <dc:description>${escapeXml(book.description)}</dc:description>
    <meta property="dcterms:modified">${modifiedDate}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${manifestItems}  </manifest>
  <spine>
    <itemref idref="nav"/>
${spineItems}  </spine>
</package>`.trim();
  zip.file("OEBPS/content.opf", opfXml);

  // 5. Generate zip archive buffer
  const content = await zip.generateAsync({
    type: "nodebuffer",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
  });

  return content;
}
