# Product Requirements Document
## Personal Publishing Platform (Blogs / Papers / Books)

**Version:** 1.0
**Owner:** [Your name]
**Status:** Draft for build

---

## 1. Product Overview

A personal publishing platform where the owner (single author) publishes three distinct content types — blog posts, research papers, and books — through a unified but content-aware reading experience. The core differentiator is structure: each content type gets navigation, metadata, and reading affordances suited to it, rather than forcing everything into a generic "post" template.

**One-line pitch:** A personal site that reads like a small, well-organized digital library, not a blog feed.

---

## 2. Goals & Non-Goals

### Goals
- Give each content type (blog / paper / book) its own appropriate reading experience
- Make the whole site navigable by topic, not just chronology
- Support long-form reading well: TOC, progress, citations, downloads
- Keep the authoring workflow low-friction (markdown-based, no fighting a CMS)
- Ship an MVP fast, then layer structure — not the reverse

### Non-Goals (v1)
- Multi-author support
- Comments/discussion system (defer — moderation overhead)
- Monetization/paywall (defer)
- Real-time collaboration or peer review workflows
- Native mobile app

---

## 3. Target Users

| User | Need |
|---|---|
| **You (author/admin)** | Fast publishing workflow, minimal formatting friction, content-type-aware editing |
| **Casual reader** | Discover a blog post via search/social, read it comfortably, maybe browse related topics |
| **Deep reader** | Comes for a paper or book, wants TOC, citations, downloadable PDF, ability to resume reading |
| **Researcher/citer** | Wants to cite your paper — needs stable URLs, abstract, metadata, maybe a "cite this" block |

---

## 4. Content Model

Three first-class content types, sharing a common base schema, each with type-specific fields.

### 4.1 Shared fields (all content types)
```
id            slug           title
type          (blog | paper | book)
summary       (short abstract/description, 1-3 sentences)
topics        (array of topic tags)
status        (draft | published | archived)
published_at  updated_at
cover_image   (optional)
reading_time_minutes
```

### 4.2 Blog post — additional fields
```
body            (markdown/MDX)
related_content (optional links to papers/books this post expands on)
```

### 4.3 Research paper — additional fields
```
abstract
authors           (default: you, but structured for co-authors later)
sections          (structured body: intro, methodology, results, etc. — or free-form markdown with heading-based TOC)
citations          (bibliography, structured: author/year/title/url)
pdf_file          (downloadable original)
doi_or_identifier (optional, for citability)
cite_as           (auto-generated citation string: APA/MLA)
```

### 4.4 Book — additional fields
```
chapters       (ordered list: title, slug, body, order_index)
status_per_chapter (draft | published) — allows serialized publishing
cover_image    (required, more prominent than blog/paper)
epub_file      (optional download)
pdf_file       (optional download)
reading_progress (per-visitor, stored client-side/localStorage v1; account-based later)
```

### 4.5 Topic (taxonomy)
```
id    slug    name    description
content_count (derived)
```

---

## 5. Information Architecture

```
/                     → Home: recent + featured across all types
/blog                 → Blog stream (chronological, filterable by topic)
/blog/[slug]          → Single post
/papers                → Paper index (abstract-first list, like a journal TOC)
/papers/[slug]         → Single paper (abstract, TOC, sections, citations, download)
/books                 → Book shelf (cover-grid)
/books/[slug]           → Book landing (description, chapter list, cover)
/books/[slug]/[chapter] → Chapter reader (TOC sidebar, progress, prev/next)
/topics                → Topic index (browse by subject across all types)
/topics/[slug]          → Everything tagged with this topic, grouped by type
/search                → Full-text search across all content
/about                  → Author bio
```

**Navigation principle:** Content-type is the primary nav axis (Blog / Papers / Books / Topics), not a flat "all posts" feed. Topic browsing is a secondary, cross-cutting axis.

---

## 6. Feature List & Prioritization

### MVP (Phase 1) — ship this first
- [ ] Three content types with distinct templates (blog, paper, book/chapter)
- [ ] Markdown/MDX-based authoring (files or lightweight CMS — see §8)
- [ ] Topic tagging + topic index page
- [ ] Reading-optimized typography (serif option for long-form, generous line-height/measure)
- [ ] Table of contents for papers and book chapters (auto-generated from headings)
- [ ] Responsive design (mobile reading matters — books/papers are long)
- [ ] Basic full-text search
- [ ] PDF download for papers
- [ ] SEO basics (meta tags, OG images, sitemap.xml)
- [ ] RSS feed (blog at minimum)

### Phase 2 — structure & polish
- [ ] "Cite this paper" auto-generated citation block
- [ ] Related content linking (blog ↔ paper ↔ book)
- [ ] Reading progress tracking (localStorage) for books
- [ ] EPUB export for books
- [ ] Newsletter signup (topic-filterable if feasible)
- [ ] Dark mode
- [ ] Better search (filters by type/topic, not just keyword)

### Phase 3 — optional, evaluate demand first
- [ ] Comments (e.g., giscus/GitHub-discussions-based to avoid building moderation infra)
- [ ] Analytics dashboard (what's actually being read)
- [ ] Multi-format co-authoring workflow
- [ ] Paid/gated content tier

**Explicit scope discipline:** Do not start Phase 2 structure work (related-content graphs, advanced taxonomy) until Phase 1 has real published content on it. Structure designed against zero content tends to be wrong.

---

## 7. Page-by-Page Functional Spec (MVP)

**Home (`/`)**
- Hero: brief author intro, one line
- 3 latest across content types (or featured picks, editable)
- Entry points to /blog, /papers, /books, /topics

**Blog stream (`/blog`)**
- Reverse-chronological list: title, summary, topic tags, reading time, date
- Filter by topic (client-side is fine for MVP)

**Paper index (`/papers`)**
- Journal-TOC style: title, authors, abstract snippet, date, topics
- Denser than blog list — this is a reference list, not a feed

**Paper page (`/papers/[slug]`)**
- Abstract at top
- Sticky/collapsible TOC (section headings)
- Body content
- Bibliography section
- "Cite as" block
- PDF download button
- Related content (if any)

**Book shelf (`/books`)**
- Cover-grid layout, title + one-line description per book

**Book landing (`/books/[slug]`)**
- Cover, description, full chapter list with status (some may be unpublished/serialized)
- "Start reading" → first published chapter

**Chapter reader (`/books/[slug]/[chapter]`)**
- Persistent chapter TOC sidebar (collapsible on mobile)
- Prev/next chapter navigation
- Reading progress indicator

**Topic page (`/topics/[slug]`)**
- Grouped by content type: "Blog posts on X", "Papers on X", "Book chapters on X"

**Search (`/search`)**
- Simple keyword match on title/summary/body (MVP: client-side index via something like Pagefind or FlexSearch; no backend needed)

---

## 8. Technical Architecture Recommendation

Given: single author, content-heavy, reading-experience-critical, needs to be buildable fast via AI-assisted ("vibe coding") workflow.

### Recommended stack
| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router)** | File-based routing maps cleanly to the IA above; huge amount of training data for AI coding tools = fewer hallucinated APIs |
| Content | **MDX files in-repo** (via Contentlayer or velite) for v1; migrate to headless CMS (e.g., Sanity/Payload) only if editing-by-git becomes painful | Git-based content = free versioning, no CMS infra to stand up for MVP |
| Styling | **Tailwind CSS** | Fast to iterate, pairs well with AI code generation, easy to enforce a typographic system via config |
| Search | **Pagefind** (static, no backend) | Zero infra, works great with statically-generated content sites |
| PDF/EPUB | Generate at build time or store as static assets in `/public` initially | Avoid building a document pipeline before you need one |
| Hosting | **Vercel** | Native Next.js support, zero-config deploys, generous free tier |
| Database | **None for MVP** (file-based content). Add Postgres (Supabase) only when you need dynamic features (comments, accounts, reading-progress sync) | Avoid premature backend complexity |

### Why file-based content over a CMS for v1
You're a single author who's comfortable writing markdown (implied by "research papers, books"). A CMS adds real infrastructure (auth, admin UI, hosting) for a problem — non-technical editing — you don't have yet. Revisit if/when co-authors or non-technical editing become real requirements.

---

## 9. Data Model (if/when a DB is introduced — Phase 2+)

```
Content
├── id, slug, type, title, summary, topics[], status
├── published_at, updated_at, cover_image, reading_time

BlogPost (extends Content)
├── body, related_content[]

Paper (extends Content)
├── abstract, authors[], body, citations[], pdf_url, doi, cite_as

Book (extends Content)
├── description, cover_image, chapters[]

Chapter
├── id, book_id, slug, title, body, order_index, status

Topic
├── id, slug, name, description
```

For MVP with file-based content, this maps directly to MDX frontmatter — no DB needed.

---

## 10. Non-Functional Requirements

- **Performance:** Lighthouse 90+ on all pages; static generation (SSG) wherever possible
- **SEO:** Proper meta tags, structured data (Article/ScholarlyArticle schema.org markup for papers), sitemap, OG images per content type
- **Accessibility:** WCAG AA — this matters more than usual given long-form reading is core to the product
- **Reading experience:** measure (line length) capped ~65-75 characters, adjustable font size, dark mode (Phase 2)

---

## 11. Build Phases (structured for AI-assisted / "vibe coding" execution)

Each phase should be a self-contained prompt/session with a clear "done" state, so an AI coding assistant can execute it without needing the full PRD re-explained each time.

**Phase 0 — Scaffold**
- Next.js + Tailwind + MDX pipeline set up
- Base layout, typography system, nav shell (Blog / Papers / Books / Topics)
- Deploy pipeline to Vercel working end-to-end with a placeholder page

**Phase 1 — Blog (simplest content type first)**
- Blog list + single post page
- MDX frontmatter schema for blog
- Topic tagging wired to a basic /topics page
- One real published post as a content smoke-test

**Phase 2 — Papers**
- Paper index + paper page template
- TOC auto-generation from headings
- Citation/bibliography rendering
- PDF download

**Phase 3 — Books**
- Book shelf + book landing + chapter reader
- Chapter TOC sidebar, prev/next nav

**Phase 4 — Cross-cutting**
- Search (Pagefind integration)
- RSS feed
- SEO pass (meta, sitemap, structured data)

**Phase 5 — Polish**
- Dark mode
- Related content linking
- Citation block, EPUB export

**Acceptance criteria per phase:** each phase ships with at least one real piece of content populated, not just an empty template — this is what catches IA/schema mistakes early.

---

## 12. Open Questions (decide before/during Phase 0)

1. Do you already have content written, or are you starting from zero? (Affects whether schema needs to accommodate legacy formats.)
2. Are papers single-author only, or should the schema support co-authors from the start?
3. Books: written all at once, or serialized/published chapter by chapter over time?
4. Any existing domain/branding, or is naming/visual identity still open?
5. Comments — likely yes/no/undecided? (Affects whether Phase 3 giscus integration is worth planning for.)

---

## 13. Success Metrics (define once live)

- Time-on-page for papers/books (proxy for whether the reading experience is working)
- Search usage (proxy for whether content is discoverable)
- Return visits (proxy for whether topic browsing creates exploration)
