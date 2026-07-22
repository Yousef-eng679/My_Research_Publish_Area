"use server";

import { db, blogs, papers, books, chapters } from "@/lib/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { validateAndSanitizeText, validateSlug, validateTopics } from "@/lib/inputValidation";

// Security check helper
async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) throw new Error("Unauthorized: Missing session token.");

    const secretStr = process.env.JWT_SECRET;
    if (!secretStr) throw new Error("Server error: JWT secret not configured.");

    const secret = new TextEncoder().encode(secretStr);
    await jwtVerify(token, secret);
  } catch (err) {
    throw new Error("Unauthorized action. Please log in again.");
  }
}

// -------------------------------------------------------------
// 1. BLOG ACTIONS
// -------------------------------------------------------------

export async function saveBlog(formData: {
  id?: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  topics: string[];
  status: "draft" | "published" | "archived";
  coverImage?: string;
  readingTimeMinutes?: number;
}) {
  await verifyAdminAuth();

  const readingTime = formData.readingTimeMinutes || Math.max(1, Math.ceil(formData.body.split(/\s+/).length / 200));

  const data = {
    slug: validateSlug(formData.slug),
    title: validateAndSanitizeText(formData.title, 500),
    summary: validateAndSanitizeText(formData.summary, 2000),
    body: formData.body,
    topics: validateTopics(formData.topics),
    status: formData.status,
    coverImage: formData.coverImage?.trim() || null,
    readingTimeMinutes: readingTime,
    updatedAt: new Date(),
  };

  if (formData.id) {
    // Update existing
    await db.update(blogs).set(data).where(eq(blogs.id, formData.id));
  } else {
    // Insert new
    await db.insert(blogs).values({
      ...data,
      publishedAt: new Date(),
    });
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${formData.slug}`);
  revalidatePath("/topics");
}

export async function deleteBlog(id: number, slug: string) {
  await verifyAdminAuth();
  await db.delete(blogs).where(eq(blogs.id, id));
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

// -------------------------------------------------------------
// 2. PAPER ACTIONS
// -------------------------------------------------------------

export async function savePaper(formData: {
  id?: number;
  slug: string;
  title: string;
  abstract: string;
  authors: string[];
  body: string;
  citations: Array<{ author: string; year: string; title: string; url?: string }>;
  pdfUrl?: string;
  doi?: string;
  citeAs?: string;
  topics: string[];
  status: "draft" | "published";
  coverImage?: string;
  readingTimeMinutes?: number;
}) {
  await verifyAdminAuth();

  const readingTime = formData.readingTimeMinutes || Math.max(1, Math.ceil(formData.body.split(/\s+/).length / 200));

  const data = {
    slug: validateSlug(formData.slug),
    title: validateAndSanitizeText(formData.title, 500),
    abstract: validateAndSanitizeText(formData.abstract, 3000),
    authors: formData.authors.map((a) => validateAndSanitizeText(a, 200)).filter((a) => a !== ""),
    body: formData.body,
    citations: formData.citations.map((c) => ({
      author: validateAndSanitizeText(c.author, 200),
      year: validateAndSanitizeText(c.year, 20),
      title: validateAndSanitizeText(c.title, 500),
      url: c.url?.trim() || undefined,
    })),
    pdfUrl: formData.pdfUrl?.trim() || null,
    doi: validateAndSanitizeText(formData.doi, 200) || null,
    citeAs: validateAndSanitizeText(formData.citeAs, 500) || null,
    topics: validateTopics(formData.topics),
    status: formData.status,
    coverImage: formData.coverImage?.trim() || null,
    readingTimeMinutes: readingTime,
    updatedAt: new Date(),
  };

  if (formData.id) {
    await db.update(papers).set(data).where(eq(papers.id, formData.id));
  } else {
    await db.insert(papers).values({
      ...data,
      publishedAt: new Date(),
    });
  }

  revalidatePath("/");
  revalidatePath("/papers");
  revalidatePath(`/papers/${formData.slug}`);
  revalidatePath("/topics");
}

export async function deletePaper(id: number, slug: string) {
  await verifyAdminAuth();
  await db.delete(papers).where(eq(papers.id, id));
  revalidatePath("/");
  revalidatePath("/papers");
  revalidatePath(`/papers/${slug}`);
}

// -------------------------------------------------------------
// 3. BOOK ACTIONS
// -------------------------------------------------------------

export async function saveBook(formData: {
  id?: number;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  topics: string[];
  status: "draft" | "published";
  pdfUrl?: string;
}) {
  await verifyAdminAuth();

  const data = {
    slug: validateSlug(formData.slug),
    title: validateAndSanitizeText(formData.title, 500),
    description: validateAndSanitizeText(formData.description, 3000),
    coverImage: formData.coverImage.trim(),
    topics: validateTopics(formData.topics),
    status: formData.status,
    pdfUrl: formData.pdfUrl?.trim() || null,
    updatedAt: new Date(),
  };

  if (formData.id) {
    await db.update(books).set(data).where(eq(books.id, formData.id));
  } else {
    await db.insert(books).values({
      ...data,
      publishedAt: new Date(),
    });
  }

  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath(`/books/${formData.slug}`);
  revalidatePath("/topics");
}

export async function deleteBook(id: number, slug: string) {
  await verifyAdminAuth();
  await db.delete(books).where(eq(books.id, id));
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath(`/books/${slug}`);
}

// -------------------------------------------------------------
// 4. CHAPTER ACTIONS
// -------------------------------------------------------------

export async function saveChapter(formData: {
  id?: number;
  bookId: number;
  bookSlug: string; // for path validation
  slug: string;
  title: string;
  body: string;
  orderIndex: number;
  status: "draft" | "published";
  pdfUrl?: string;
}) {
  await verifyAdminAuth();

  const data = {
    bookId: formData.bookId,
    slug: validateSlug(formData.slug),
    title: validateAndSanitizeText(formData.title, 500),
    body: formData.body,
    orderIndex: formData.orderIndex,
    status: formData.status,
    pdfUrl: formData.pdfUrl?.trim() || null,
    updatedAt: new Date(),
  };

  if (formData.id) {
    await db.update(chapters).set(data).where(eq(chapters.id, formData.id));
  } else {
    await db.insert(chapters).values({
      ...data,
      publishedAt: new Date(),
    });
  }

  revalidatePath(`/books/${formData.bookSlug}`);
  revalidatePath(`/books/${formData.bookSlug}/${formData.slug}`);
}

export async function deleteChapter(id: number, bookSlug: string, chapterSlug: string) {
  await verifyAdminAuth();
  await db.delete(chapters).where(eq(chapters.id, id));
  revalidatePath(`/books/${bookSlug}`);
  revalidatePath(`/books/${bookSlug}/${chapterSlug}`);
}
