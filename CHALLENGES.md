# Engineering Challenges & Technical Solutions Catalog

This document catalogs the primary engineering challenges, edge cases, and security vulnerabilities encountered during the development of **Yousef's Library & Digital Research Archive**, along with the architectural solutions implemented to solve them.

---

## 1. Challenge: Next.js Dev Server 404s on Runtime Uploaded Assets

###  Problem & Symptom
In Next.js App Router, static files placed in `public/uploads/` at runtime are not immediately indexed by the Next.js static asset server without restarting the process. Users uploading PDF papers or cover images faced `404 Not Found` errors when attempting to view or download uploaded assets immediately after submitting the admin forms.

###  Technical Solution & Edge Case Handling
Created a dynamic catch-all route at [**`app/uploads/[...path]/route.ts`**](file:///c:/joe_publish%20_area/app/uploads/%5B...path%5D/route.ts):
- Intercepts all `/uploads/*` requests dynamically.
- Reads binary buffers directly from the filesystem at runtime using Node `fs/promises`.
- Automatically deduces standard MIME types (`image/png`, `image/jpeg`, `application/pdf`, `image/svg+xml`).
- Appends security headers (`X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'`) and blocks execution of dangerous dynamic script extensions (`.html`, `.js`, `.php`, `.sh`, `.exe`).

---

## 2. Challenge: File Signature Spoofing (Malicious Upload Extensions)

###  Problem & Symptom
Relying solely on file extension validation (e.g. checking `.pdf` or `.png`) allows malicious users to bypass upload filters by renaming executable files or scripts (e.g., `payload.exe` → `document.pdf`).

### 🛡️ Technical Solution & Edge Case Handling
Built binary magic byte signature verification in [**`lib/uploadSecurity.ts`**](file:///c:/joe_publish%20_area/lib/uploadSecurity.ts):
- Reads the raw array buffer of every incoming file prior to saving.
- Inspects first 4-8 binary header bytes:
  * **PDF:** Verifies `%PDF-` (`0x25, 0x50, 0x44, 0x46`)
  * **PNG:** Verifies `\x89PNG` (`0x89, 0x50, 0x4E, 0x47`)
  * **JPEG:** Verifies `0xFF, 0xD8, 0xFF`
- Enforces strict file size thresholds (15MB for PDF, 5MB for images) and rejects spoofed files with `400 Bad Request`.

---

## 3. Challenge: Cross-Site Scripting (XSS) in Markdown & Reflected Search Inputs

###  Problem & Symptom
Allowing authors to import `.md` files or render raw Markdown bodies could allow injected `<script>`, `onload=`, `onerror=`, `<iframe>`, or `javascript:` links to execute in the reader's browser. Furthermore, reflecting search queries directly in empty-state UI could lead to Reflected XSS.

###  Technical Solution & Edge Case Handling
- **Markdown Sanitization:** Built `sanitizeHtmlContent` in [**`lib/securityUtils.ts`**](file:///c:/joe_publish%20_area/lib/securityUtils.ts) using multi-pass regex sanitization. Automatically strips `<script>`, `<iframe>`, inline `on*` attributes, and `javascript:` protocols before rendering.
- **Search Query Encoding:** Built `escapeSearchQuery` in [**`lib/securityUtils.ts`**](file:///c:/joe_publish%20_area/lib/securityUtils.ts) to HTML-encode reflected query strings on the search page.
- **Server Action Validation:** Integrated `validateAndSanitizeText` in [**`lib/inputValidation.ts`**](file:///c:/joe_publish%20_area/lib/inputValidation.ts) to sanitize and truncate text fields across `saveBlog`, `savePaper`, `saveBook`, and `saveChapter` before Neon Postgres queries.

---

## 4. Challenge: Brute-Force Password Attacks on Login API

###  Problem & Symptom
Standard `/login` endpoints are vulnerable to automated dictionary or brute-force password guessing attacks from malicious bots.

###  Technical Solution & Edge Case Handling
Implemented an IP-based sliding window rate limiter in [**`lib/rateLimiter.ts`**](file:///c:/joe_publish%20_area/lib/rateLimiter.ts):
- Tracks failed login attempts per client IP address.
- Limits requests to **5 failed attempts per 15 minutes**.
- When exceeded, returns `429 Too Many Requests` with a `Retry-After` header.
- The login UI ([**`app/(site)/login/page.tsx`**](file:///c:/joe_publish%20_area/app/%28site%29/login/page.tsx)) intercepts `429` status codes and renders a live retry countdown timer to the user.

---

## 5. Challenge: Un-Chaptered Single-Volume Book PDF Displays

###  Problem & Symptom
Authors often upload a single complete book PDF without creating individual chapter breakdowns. The landing page originally showed "No chapters released" and provided no way for users to read the volume.

###  Technical Solution & Edge Case Handling
Refactored [**`app/(site)/books/[slug]/page.tsx`**](file:///c:/joe_publish%20_area/app/%28site%29/books/%5Bslug%5D/page.tsx) and [**`components/ContinueReadingButton.tsx`**](file:///c:/joe_publish%20_area/components/ContinueReadingButton.tsx):
- If a book has no chapters but has an attached `pdfUrl`, the CTA button dynamically transforms into **Read Full Volume &rarr;**.
- Clicking the button smoothly scrolls readers down to an embedded, responsive **Full Volume Reader** PDF iframe.

---

## 6. Challenge: Dynamic EPUB 3 Ebook Generation

###  Problem & Symptom
Generating EPUB ebook files on demand requires creating a valid EPUB 3 zip archive container, including `mimetype`, `META-INF/container.xml`, OPF metadata manifest, TOC navigation XHTML, and individual chapter XHTML files without relying on heavy external CLI binaries.

###  Technical Solution & Edge Case Handling
Implemented a pure TypeScript EPUB compiler using `JSZip` in `lib/epub.ts`:
- Generates valid EPUB 3 container XML structures.
- Dynamically compiles markdown chapter contents into valid XHTML documents.
- Serves generated EPUB files on-the-fly via `/api/books/[slug]/epub` route with `Content-Type: application/epub+zip`.
