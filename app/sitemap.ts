import { MetadataRoute } from "next";
import { db, blogs, papers, books, chapters } from "@/lib/db";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antigravity-library.vercel.app";

  let blogUrls: MetadataRoute.Sitemap = [];
  let paperUrls: MetadataRoute.Sitemap = [];
  let bookUrls: MetadataRoute.Sitemap = [];
  let chapterUrls: MetadataRoute.Sitemap = [];

  try {
    // 1. Fetch published blogs
    const dbBlogs = await db.select().from(blogs).where(eq(blogs.status, "published"));
    blogUrls = dbBlogs.map((p) => ({
      url: `${baseUrl}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    }));

    // 2. Fetch published papers
    const dbPapers = await db.select().from(papers).where(eq(papers.status, "published"));
    paperUrls = dbPapers.map((p) => ({
      url: `${baseUrl}/papers/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    }));

    // 3. Fetch published books
    const dbBooks = await db.select().from(books).where(eq(books.status, "published"));
    bookUrls = dbBooks.map((p) => ({
      url: `${baseUrl}/books/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    }));

    // 4. Fetch chapters
    const dbChapters = await db.select().from(chapters).where(eq(chapters.status, "published"));
    
    // For each chapter, we query the parent book to get the book slug
    const resolvedChapters = await Promise.all(
      dbChapters.map(async (c) => {
        const parentBook = dbBooks.find((b) => b.id === c.bookId);
        if (parentBook) {
          return {
            url: `${baseUrl}/books/${parentBook.slug}/${c.slug}`,
            lastModified: new Date(c.updatedAt),
          };
        }
        return null;
      })
    );
    chapterUrls = resolvedChapters.filter(Boolean) as MetadataRoute.Sitemap;
  } catch (err) {
    console.error("Failed to compile dynamic sitemap elements:", err);
  }

  // Static site entry points
  const staticRoutes = ["", "/blog", "/papers", "/books", "/topics", "/search"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...blogUrls, ...paperUrls, ...bookUrls, ...chapterUrls];
}
