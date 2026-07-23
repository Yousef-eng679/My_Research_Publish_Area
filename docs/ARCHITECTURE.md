# System Architecture & Data Flows

This document details the architectural design, database entity schemas, security boundaries, and data flow pipelines of **Yousef's Library & Digital Research Archive**.

---

## 🏗️ System Architecture Diagram

```
[ Browser Client ]
       │
       ▼
[ Next.js Middleware (proxy.ts) ] ── (Validates JWT admin_session Cookie)
       │
       ├──► Public Site Routes (App Router)
       │    ├── Home (/)
       │    ├── Research Papers (/papers)
       │    ├── Serialized Books (/books)
       │    ├── Engineering Blog (/blog)
       │    ├── Topics (/topics)
       │    └── About (/about)
       │
       ├──► Dynamic Assets Route (/uploads/[...path]) ── (Streams Local Filesystem)
       │
       └──► Protected Admin Dashboard (/admin/*)
            ├── Save / Delete Actions (verifyAdminAuth)
            └── Upload Endpoint (/api/admin/upload) ──► Magic Byte Signature Check
                                                              │
                                                              ▼
                                                   [ Neon Serverless Postgres ]
```

---

## 🗄️ Database Entity Schemas (Neon Postgres)

The application uses **Drizzle ORM** connected to **Neon Serverless Postgres**.

### 1. `blogs`
- `id`: serial primary key
- `slug`: text unique
- `title`: text
- `summary`: text
- `body`: text
- `coverImage`: text nullable
- `topics`: text array
- `readingTimeMinutes`: integer
- `status`: text (`draft` | `published` | `archived`)
- `publishedAt`, `updatedAt`: timestamp

### 2. `papers`
- `id`: serial primary key
- `slug`: text unique
- `title`: text
- `abstract`: text
- `authors`: text array
- `body`: text
- `citations`: jsonb array of citation objects
- `pdfUrl`: text nullable
- `doi`: text nullable
- `citeAs`: text nullable
- `topics`: text array
- `status`: text (`draft` | `published`)
- `publishedAt`, `updatedAt`: timestamp

### 3. `books`
- `id`: serial primary key
- `slug`: text unique
- `title`: text
- `description`: text
- `coverImage`: text
- `pdfUrl`: text nullable
- `topics`: text array
- `status`: text (`draft` | `published`)
- `publishedAt`, `updatedAt`: timestamp

### 4. `chapters`
- `id`: serial primary key
- `bookId`: integer foreign key -> `books.id`
- `slug`: text unique per book
- `title`: text
- `body`: text
- `orderIndex`: integer
- `pdfUrl`: text nullable
- `status`: text (`draft` | `published`)
- `publishedAt`, `updatedAt`: timestamp

---

## 🛡️ Security Boundaries

1. **Authentication Boundary:** Standard paths protected by Next.js `proxy.ts` middleware and `verifyAdminAuth()` server action guards.
2. **Input Boundary:** `lib/inputValidation.ts` enforces sanitization, slug normalization, and length constraints on all input models.
3. **Upload Boundary:** `lib/uploadSecurity.ts` verifies magic numbers (`%PDF-`, `\x89PNG`, `0xFFD8FF`) before writing files to `public/uploads/`.
