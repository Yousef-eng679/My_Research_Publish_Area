# Antigravity Execution Plan
## Personal Publishing Platform — Step-by-Step Agent Prompts

**How to use this document:** Each numbered item below is a single, self-contained prompt to paste into Antigravity as a new agent task. Run them **in order** — don't start Phase N+1 until Phase N's verification step passes. Use **Plan mode** for anything marked 🧠 (complex/architectural) and **Fast mode** for anything marked ⚡ (small, mechanical). After each task, check the agent's Artifacts (plan, screenshots, terminal output) before approving — don't just trust a "done" message.

Recommended Antigravity setting for this build: **Agent-assisted mode**, Terminal Policy = Auto. Switch to Review-driven mode only if you want to approve every file write during Phase 0.

---

## PHASE 0 — Scaffold

### 0.1 🧠 Project setup
```
Create a new Next.js 14+ project using the App Router and TypeScript.
Set up Tailwind CSS. Set up an MDX content pipeline using Contentlayer
(or velite if Contentlayer has compatibility issues with the current
Next.js version — check and use whichever is actively maintained).

Create this folder structure:
- /content/blog/
- /content/papers/
- /content/books/
- /app/(site)/blog/
- /app/(site)/papers/
- /app/(site)/books/
- /app/(site)/topics/
- /app/(site)/search/
- /components/
- /lib/

Do not build any page content yet. Just get the project running with
`npm run dev`, Tailwind confirmed working (test with a styled placeholder
on the home page), and MDX pipeline confirmed working (create one dummy
.mdx file in /content/blog/ and confirm it can be read/parsed).

Verify by taking a screenshot of the running dev server showing the
styled placeholder page.
```
**Verify:** Dev server runs, placeholder page is styled, one dummy MDX file parses without error.

### 0.2 ⚡ Base layout & typography system
```
Build the base site layout: a persistent header with nav links (Blog,
Papers, Books, Topics, Search) and a footer. Implement a typography
system in Tailwind config optimized for long-form reading: max content
width ~65-75 characters, generous line-height (1.6-1.8), a serif font
option for body text (use a Google Font like Lora or Source Serif 4),
sans-serif for UI chrome (Inter or similar).

Apply this layout to the home page. Take a screenshot to confirm nav
and typography render correctly on both desktop and mobile widths
(test at 1440px and 390px).
```
**Verify:** Screenshots at both widths look intentional, not default-Tailwind.

### 0.3 ⚡ Deploy pipeline
```
Set up deployment to Vercel for this project. Confirm the site builds
and deploys successfully, and give me the live URL. If Vercel CLI/auth
isn't available in this environment, instead prepare the project so it's
one `vercel deploy` command away, and give me exact terminal commands to
run manually.
```
**Verify:** Live URL works, or exact deploy commands are documented.

---

## PHASE 1 — Blog (simplest content type first)

### 1.1 🧠 Blog data schema + list page
```
Define the MDX frontmatter schema for blog posts:
slug, title, summary, topics (array), status (draft|published),
published_at, updated_at, cover_image (optional), reading_time_minutes
(auto-calculated from word count, don't require manual input).

Build /app/(site)/blog/page.tsx: a reverse-chronological list of
published posts showing title, summary, topic tags, reading time,
and date. Only show status=published posts.

Build /app/(site)/blog/[slug]/page.tsx: renders the full MDX body with
the typography system from Phase 0, plus topic tags and date at the top.

Create 2 real dummy blog posts (not lorem ipsum — write short real
placeholder content about any topic) so we have something to look at.

Take screenshots of both the list page and a single post page.
```
**Verify:** List page shows both posts correctly sorted; individual post renders with correct typography; draft posts (if you add one) do NOT appear on the list.

### 1.2 ⚡ Topic tagging + topic index
```
Build /app/(site)/topics/page.tsx: lists all unique topics found across
content in /content/, with a count of how many items use each topic.

Build /app/(site)/topics/[slug]/page.tsx: shows all published content
tagged with this topic, grouped by content type (for now just blog,
since papers/books don't exist yet — but write the grouping logic to
be type-aware so it's ready for papers/books later).

Take a screenshot confirming topic pages work using the 2 dummy blog
posts from the previous step.
```
**Verify:** Topic index lists topics with correct counts; clicking through to a topic shows the right posts.

---

## PHASE 2 — Papers

### 2.1 🧠 Paper schema + index page
```
Define the MDX frontmatter schema for papers, extending the shared
content schema: abstract, authors (array, default to a single configurable
author name), citations (array of {author, year, title, url}), pdf_url
(optional), doi_or_identifier (optional).

Build /app/(site)/papers/page.tsx: journal-table-of-contents style list
— denser than the blog list. Show title, authors, abstract snippet
(first ~150 chars), date, topics.

Create 1 real dummy paper with at least 3 headed sections in the body
and 2-3 dummy citations, so we can test TOC and bibliography rendering
in the next step.
```
**Verify:** Paper index page shows the dummy paper correctly formatted, denser than blog list.

### 2.2 🧠 Paper page with TOC, citations, cite-as block
```
Build /app/(site)/papers/[slug]/page.tsx with:
1. Abstract displayed prominently at the top
2. An auto-generated table of contents built from the h2/h3 headings
   in the MDX body — sticky on desktop, collapsible on mobile
3. The rendered body content
4. A bibliography section rendering the citations array
5. An auto-generated "Cite this paper" block in APA format, computed
   from the frontmatter (author, year, title, site name, url)
6. A PDF download button if pdf_url is present in frontmatter (if not
   present, hide the button — don't show a broken link)

Test with the dummy paper from the previous step. Take a screenshot
showing the TOC, abstract, and cite-as block all visible.
```
**Verify:** TOC links correctly jump to headings; cite-as block has correct formatting; missing pdf_url doesn't break the page.

---

## PHASE 3 — Books

### 3.1 🧠 Book + chapter schema, shelf page
```
Define schemas for books and chapters:
Book: slug, title, description, cover_image, topics, status
Chapter: book_slug, slug, title, order_index, status (draft|published), body

Build /app/(site)/books/page.tsx: a cover-grid layout (not a list —
visually distinct from blog/papers), showing book cover, title, and
one-line description for each book.

Create 1 dummy book with 3 dummy chapters (2 published, 1 draft) to
test serialized-publishing behavior in the next step.
```
**Verify:** Cover-grid renders and is visually distinct from the blog/paper list layouts.

### 3.2 🧠 Book landing + chapter reader
```
Build /app/(site)/books/[slug]/page.tsx: shows cover, description, and
the full chapter list. Published chapters are clickable; draft chapters
show as "coming soon" (visible in the list but not clickable) — this is
important, it's how we support serialized publishing.

Build /app/(site)/books/[slug]/[chapter]/page.tsx: the chapter reader.
Include:
1. A persistent chapter TOC sidebar (all chapters, current one highlighted),
   collapsible on mobile
2. Prev/next chapter navigation at the bottom
3. Reading progress: store "last read chapter" per book in localStorage,
   and show a "Continue reading" link on the book landing page if progress
   exists

Test with the dummy book (2 published, 1 draft chapter). Confirm the
draft chapter is NOT reachable via direct URL either (not just hidden
from nav — actually blocked, return 404 or redirect).
```
**Verify:** Draft chapter is genuinely inaccessible; prev/next nav works at both ends of the chapter list; localStorage progress persists across a page reload.

---

## PHASE 4 — Cross-cutting features

### 4.1 ⚡ Search
```
Integrate Pagefind (static search, no backend) into this project.
Index all published content across blog, papers, and books at build time.
Build /app/(site)/search/page.tsx with a search input and results list
showing content type, title, and a snippet.

Test by searching for a word that appears in the dummy blog post AND
the dummy paper — confirm both show up with correct type labels.
```
**Verify:** Search returns results across all 3 content types, correctly labeled.

### 4.2 ⚡ RSS feed + sitemap + SEO metadata
```
Generate an RSS feed at /blog/rss.xml for blog posts.
Generate sitemap.xml covering all published content across all 3 types.
Add proper meta tags (title, description, Open Graph, Twitter card) to
every page template — home, blog list/post, paper list/post, book
list/landing/chapter, topics.
For papers specifically, add schema.org ScholarlyArticle structured
data in the page head.

Verify sitemap.xml and rss.xml are reachable and valid, and check one
page's rendered <head> to confirm meta tags are present.
```
**Verify:** sitemap.xml and rss.xml load without error; view-source on a paper page shows ScholarlyArticle JSON-LD.

---

## PHASE 5 — Polish

### 5.1 ⚡ Dark mode
```
Add a dark mode toggle to the header, using Tailwind's dark mode class
strategy. Ensure the reading typography (especially the serif body font)
remains high-contrast and comfortable in dark mode — don't just invert
colors, actually tune the dark palette. Persist the user's choice in
localStorage. Take screenshots of a blog post and a paper page in both
light and dark mode.
```
**Verify:** Dark mode screenshots look intentional, not just inverted; toggle persists on reload.

### 5.2 ⚡ Related content linking
```
Add an optional `related_content` field to the blog post schema
(array of slugs, can point to papers or books). On the blog post page,
render a "Related" section at the bottom if related_content is present.
Wire the dummy blog post to link to the dummy paper as a test.
```
**Verify:** Related content section appears and links work when the field is populated, and is hidden entirely when it's empty.

### 5.3 ⚡ EPUB export for books
```
Add EPUB generation for books — either at build time (generate a static
.epub per book from its published chapters) or via an on-demand API
route. Add a download button on the book landing page. Test by
downloading the dummy book's EPUB and confirming it opens in an EPUB
reader (or validates with an EPUB validator tool if no reader is
available).
```
**Verify:** Generated EPUB file is valid and contains only published chapters (not the draft one).

---

## Notes for running this plan

- **Replace dummy content before going live.** Every phase creates placeholder content specifically so each step is independently testable — none of it should ship.
- **If an agent task fails partway**, don't immediately re-run the whole prompt — ask it to diagnose what broke first, then fix, to avoid duplicate/conflicting code.
- **Re-verify Phase 1 acceptance criteria after Phase 4** (search/SEO), since cross-cutting changes sometimes silently break earlier pages — worth one regression pass before calling the MVP done.
