import test from "node:test";
import assert from "node:assert";
import { parseMarkdownWithFrontmatter } from "./parser";
import { sanitizeFilename, getUploadDirectory } from "./upload";

test("Markdown Frontmatter Parser - parseMarkdownWithFrontmatter", () => {
  const content = `---
title: "Gravity Waves and Antigravity"
summary: A comprehensive review of localized antigravity distortions.
topics: [physics, aerospace, general-relativity]
---
# Introduction
This is the body text.`;

  const parsed = parseMarkdownWithFrontmatter(content);
  assert.strictEqual(parsed.metadata.title, "Gravity Waves and Antigravity");
  assert.strictEqual(parsed.metadata.summary, "A comprehensive review of localized antigravity distortions.");
  assert.deepStrictEqual(parsed.metadata.topics, ["physics", "aerospace", "general-relativity"]);
  assert.strictEqual(parsed.body, "# Introduction\nThis is the body text.");
});

test("Markdown Parser - parses content without frontmatter", () => {
  const content = "# Simple Markdown\nNo metadata here.";
  const parsed = parseMarkdownWithFrontmatter(content);
  assert.deepStrictEqual(parsed.metadata, {});
  assert.strictEqual(parsed.body, "# Simple Markdown\nNo metadata here.");
});

test("Upload Helper - sanitizeFilename", () => {
  const filename = "My Diagram!!! #2.PNG";
  const sanitized = sanitizeFilename(filename);

  // Should start with sanitized base name
  assert.ok(sanitized.startsWith("my-diagram-2-"));
  // Should end with lowercase extension
  assert.ok(sanitized.endsWith(".png"));
});

test("Upload Helper - getUploadDirectory", () => {
  assert.strictEqual(getUploadDirectory("document.pdf"), "public/uploads/pdfs");
  assert.strictEqual(getUploadDirectory("image.jpeg"), "public/uploads/images");
  assert.strictEqual(getUploadDirectory("notes.md"), "public/uploads/documents");
});
