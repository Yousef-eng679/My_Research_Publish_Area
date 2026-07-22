import { db, blogs } from "@/lib/db";
import { desc } from "drizzle-orm";
import BlogManager from "./BlogManager";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  // Query all blogs from Postgres, sorted by date descending
  const allBlogs = await db
    .select()
    .from(blogs)
    .orderBy(desc(blogs.publishedAt));

  return <BlogManager initialPosts={allBlogs} />;
}
