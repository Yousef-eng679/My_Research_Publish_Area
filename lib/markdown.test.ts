import test from "node:test";
import assert from "node:assert";
import { compileMarkdown, compileMarkdownWithCitations, generateToc } from "./markdown";
import { generateEpub } from "./epub";
import JSZip from "jszip";

test("Markdown Compiler - compileMarkdown basic headers", () => {
  const md = "# Heading 1\n## Heading 2\n\nThis is some body text.";
  const html = compileMarkdown(md);

  // Assert it maps correct tags and ID anchors
  assert.match(html, /<h1 id="heading-1">Heading 1<\/h1>/);
  assert.match(html, /<h2 id="heading-2">Heading 2<\/h2>/);
  assert.match(html, /<p>This is some body text.<\/p>/);
});

test("Markdown Compiler - generateToc extracts H2 and H3", () => {
  const md = "## Section 1\nSome text\n### Subsection A\nOther text\n## Section 2";
  const toc = generateToc(md);

  assert.strictEqual(toc.length, 3);
  assert.deepStrictEqual(toc[0], { id: "section-1", text: "Section 1", level: 2 });
  assert.deepStrictEqual(toc[1], { id: "subsection-a", text: "Subsection A", level: 3 });
  assert.deepStrictEqual(toc[2], { id: "section-2", text: "Section 2", level: 2 });
});

test("Markdown Compiler - compileMarkdownWithCitations substitutes inline tooltips", () => {
  const body = "According to [Smith 2026], AI agents compile fast.";
  const citations = [
    {
      author: "Smith, J. A.",
      year: "2026",
      title: "Agentic Compilation Loops",
      url: "https://neon.tech",
    },
  ];

  const html = compileMarkdownWithCitations(body, citations);

  // Check tooltip rendering components
  assert.match(html, /href="#reference-0"/);
  assert.match(html, /\[Smith 2026\]/);
  assert.match(html, /Smith, J. A. \(2026\)/);
  assert.match(html, /Agentic Compilation Loops/);
  assert.match(html, /https:\/\/neon.tech/);
});

test("EPUB Generator - compiles valid EPUB 3 zip structure", async () => {
  const book = {
    title: "Quantum Decoupling",
    author: "Dr. Voli",
    description: "An inquiry into antigravity frameworks.",
    chapters: [
      {
        title: "Introduction",
        body: "## Scope\nThis chapter details the background.",
        orderIndex: 1,
      },
    ],
  };

  const buffer = await generateEpub(book);
  assert.ok(buffer instanceof Buffer);
  assert.ok(buffer.length > 200);

  // Unzip and inspect files
  const zip = await JSZip.loadAsync(buffer);
  
  // Assert presence of mandatory EPUB layout items
  assert.ok(zip.file("mimetype"));
  assert.ok(zip.file("META-INF/container.xml"));
  assert.ok(zip.file("OEBPS/content.opf"));
  assert.ok(zip.file("OEBPS/nav.xhtml"));
  assert.ok(zip.file("OEBPS/chapter_1.xhtml"));

  // Check mimetype is uncompressed
  const mimeContent = await zip.file("mimetype")?.async("string");
  assert.strictEqual(mimeContent, "application/epub+zip");

  // Check content metadata inside OPF file
  const opfContent = await zip.file("OEBPS/content.opf")?.async("string");
  assert.match(opfContent || "", /<dc:title>Quantum Decoupling<\/dc:title>/);
  assert.match(opfContent || "", /<dc:creator>Dr. Voli<\/dc:creator>/);
  assert.match(opfContent || "", /href="chapter_1.xhtml"/);
});

