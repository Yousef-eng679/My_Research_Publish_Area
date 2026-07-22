import test from "node:test";
import assert from "node:assert/strict";
import { checkRateLimit, resetRateLimits } from "../lib/rateLimiter";
import { validateFileBuffer, isAllowedExtension } from "../lib/uploadSecurity";
import { sanitizeHtmlContent, escapeSearchQuery } from "../lib/securityUtils";

test("Rate Limiter - blocks requests after threshold exceeded", () => {
  resetRateLimits();
  const testIp = "192.168.1.100";
  const maxAttempts = 5;

  for (let i = 0; i < maxAttempts; i++) {
    const res = checkRateLimit(testIp, maxAttempts, 60000);
    assert.equal(res.allowed, true, `Attempt ${i + 1} should be allowed`);
  }

  const blockedRes = checkRateLimit(testIp, maxAttempts, 60000);
  assert.equal(blockedRes.allowed, false, "6th attempt should be blocked");
  assert.ok(blockedRes.retryAfterSeconds > 0);
});

test("Upload Security - extension whitelist validation", () => {
  assert.equal(isAllowedExtension("document.pdf"), true);
  assert.equal(isAllowedExtension("photo.PNG"), true);
  assert.equal(isAllowedExtension("photo.jpeg"), true);
  assert.equal(isAllowedExtension("graphic.svg"), true);

  // Dangerous / forbidden extensions
  assert.equal(isAllowedExtension("script.js"), false);
  assert.equal(isAllowedExtension("shell.sh"), false);
  assert.equal(isAllowedExtension("malware.exe"), false);
  assert.equal(isAllowedExtension("payload.php"), false);
  assert.equal(isAllowedExtension("page.html"), false);
});

test("Upload Security - magic number file signature validation", () => {
  // Valid PDF Magic Bytes %PDF-
  const validPdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x35]);
  const pdfCheck = validateFileBuffer(validPdfBuffer, "pdf", 10 * 1024 * 1024);
  assert.equal(pdfCheck.valid, true);

  // Valid PNG Magic Bytes \x89PNG\r\n\x1a\n
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const pngCheck = validateFileBuffer(validPngBuffer, "png", 5 * 1024 * 1024);
  assert.equal(pngCheck.valid, true);

  // Fake PDF (Executable spoofed as PDF)
  const fakePdfBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00]); // MZ header
  const fakeCheck = validateFileBuffer(fakePdfBuffer, "pdf", 10 * 1024 * 1024);
  assert.equal(fakeCheck.valid, false);
  assert.match(fakeCheck.error || "", /signature/i);

  // File size limit breach
  const oversizedBuffer = Buffer.alloc(15 * 1024 * 1024); // 15MB
  const sizeCheck = validateFileBuffer(oversizedBuffer, "png", 5 * 1024 * 1024);
  assert.equal(sizeCheck.valid, false);
  assert.match(sizeCheck.error || "", /size/i);
});

test("XSS Protection - Markdown HTML Sanitizer", () => {
  const dangerousHtml = `
    <div>
      <h1>Clean Heading</h1>
      <script>alert('XSS')</script>
      <img src="x" onerror="alert('XSS')" />
      <a href="javascript:alert('XSS')">Malicious Link</a>
      <iframe src="http://evil.com"></iframe>
    </div>
  `;

  const sanitized = sanitizeHtmlContent(dangerousHtml);

  assert.ok(!sanitized.includes("<script>"));
  assert.ok(!sanitized.includes("onerror="));
  assert.ok(!sanitized.includes("javascript:"));
  assert.ok(!sanitized.includes("<iframe"));
  assert.ok(sanitized.includes("Clean Heading"));
});

test("Search Security - Escapes reflected search queries", () => {
  const maliciousQuery = `<script>alert("XSS")</script>`;
  const escaped = escapeSearchQuery(maliciousQuery);

  assert.equal(escaped, "&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;");
});

test("Input Validation - sanitizes text, formats slugs, and filters topics", () => {
  const { validateAndSanitizeText, validateSlug, validateTopics, isSecretAdminPathAllowed } = require("../lib/inputValidation");

  // Text sanitization and truncation
  const dirtyText = "  Hello <script>alert(1)</script> World!  ";
  const cleanText = validateAndSanitizeText(dirtyText, 20);
  assert.equal(cleanText, "Hello  World!");

  // Slug formatting
  const dirtySlug = "  My New Post Title!! -- 2026 ";
  const cleanSlug = validateSlug(dirtySlug);
  assert.equal(cleanSlug, "my-new-post-title-2026");

  // Topic array validation
  const dirtyTopics = [" Next.js ", "<b>HTML</b>", " ", "QUANTUM"];
  const cleanTopics = validateTopics(dirtyTopics);
  assert.deepEqual(cleanTopics, ["nextjs", "html", "quantum"]);

  // Admin Path Obscurity check
  assert.equal(isSecretAdminPathAllowed("/admin"), true);
  assert.equal(isSecretAdminPathAllowed("/secret-portal-99", "secret-portal-99"), true);
  assert.equal(isSecretAdminPathAllowed("/admin", "secret-portal-99"), false);
});
