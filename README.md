# Yousef's Library & Digital Research Archive 📚

A modern, high-performance, open-access digital publishing platform built for hosting computer science research papers, technical monographs, serialized books, and deep-dive engineering articles.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-Serverless-00E599?style=for-the-badge&logo=neon&logoColor=black)](https://neon.tech/)

---

## 🖥️ Visual Content Management (Admin Dashboard)

All content publishing, editing, and media management is performed **100% visually through the Admin Dashboard GUI** — zero coding or command-line commands required!

### 👑 Author Dashboard Capabilities (`/admin`)
- **Visual Drag & Drop Uploads:** Upload PDF documents (`.pdf`), cover images (`.png`, `.jpg`, `.webp`), and Markdown files (`.md`) side-by-side using dedicated upload cards.
- **Academic Paper Publisher:** Write research abstracts, attach full PDF documents, auto-generate BibTeX citations, and insert inline reference tooltips.
- **Serialized Book & Chapter Studio:** Organize books into multi-chapter volumes or publish single-volume full PDF books with responsive embedded document viewers.
- **Article & Blog Editor:** Import `.md` documents directly into the editor or write articles with live reading time estimation and topic tagging.

---

## 🌟 Key Platform Features

### 📄 Academic Research Publications
- **Embedded Document Viewer:** Responsive, full-screen PDF viewer embedded directly inside paper detail pages.
- **BIBTeX & Citation Generator:** One-click copyable BibTeX citations and inline tooltip citations (`[Author 2026]`).
- **Open-Access Direct Downloads:** Fast PDF downloads served via optimized streaming routes.

### 📖 Serialized Books & Monographs
- **Multi-Chapter Directory:** Sequential chapter navigation with reading progress persistence in `localStorage`.
- **EPUB 3 Generator:** On-the-fly zip compilation generating valid EPUB 3 ebooks for offline reading on e-readers.
- **Full Volume PDF Reader:** Supports single-file book uploads with integrated volume viewer for un-chaptered works.

### 🛡️ Production-Grade Security & Infrastructure
- **IP-Based Login Rate Limiting:** Sliding-window rate limiter protecting `/api/auth/login` against brute-force attacks (5 attempts / 15 mins lockouts).
- **Binary Magic Number Verification:** Server-side validation inspecting binary file headers (`%PDF-`, `\x89PNG`, `0xFFD8FF`) to reject spoofed files.
- **XSS Payload Sanitization:** Automatic HTML sanitization stripping `<script>`, `<iframe>`, `on*` event attributes, and `javascript:` URLs across Markdown inputs.
- **Admin Path Obscurity:** Optional `ADMIN_PATH_SECRET` route shielding admin dashboards from automated scanners behind `404 Not Found` responses.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router, Server Actions, Turbopack)
- **Language:** TypeScript
- **Styling:** Vanilla CSS & Tailwind CSS (Dark/Light glassmorphism theme)
- **Database:** Serverless Postgres via [Neon](https://neon.tech/)
- **ORM:** Drizzle ORM
- **Authentication:** HttpOnly JWT cookies (`jose`)
- **Markdown Processor:** `marked` + custom AST renderer + HTML sanitizer

---

## 📂 Repository Structure

```
├── app/
│   ├── (site)/          # Public user-facing pages (Blog, Papers, Books, Topics, About)
│   ├── admin/           # Visual Administrative Dashboard & Content Editors (/admin)
│   ├── api/             # Protected API endpoints (Auth, Uploads, Search, EPUB, RSS)
│   └── uploads/         # Dynamic runtime binary file server route
├── components/          # Reusable UI components (Header, Footer, Document Viewers, Cards)
├── lib/                 # Core utilities (Markdown compiler, Rate Limiter, Security, Uploads)
├── public/uploads/      # Persistent local upload directories
└── CHALLENGES.md        # Engineering catalog of edge cases & technical solutions
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
