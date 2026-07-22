import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const queryPattern = `%${q}%`;

  try {
    // Perform cross-table query with union
    const result = await db.execute(sql`
      SELECT 'blog' as type, slug, title, summary as description, NULL as subtitle
      FROM blogs 
      WHERE status = 'published' AND (title ILIKE ${queryPattern} OR summary ILIKE ${queryPattern} OR body ILIKE ${queryPattern})
      
      UNION ALL
      
      SELECT 'paper' as type, slug, title, abstract as description, array_to_string(authors, ', ') as subtitle
      FROM papers 
      WHERE status = 'published' AND (title ILIKE ${queryPattern} OR abstract ILIKE ${queryPattern} OR body ILIKE ${queryPattern})
      
      UNION ALL
      
      SELECT 'book' as type, slug, title, description as description, NULL as subtitle
      FROM books 
      WHERE status = 'published' AND (title ILIKE ${queryPattern} OR description ILIKE ${queryPattern})
      
      UNION ALL
      
      SELECT 'chapter' as type, chapters.slug, chapters.title, SUBSTRING(chapters.body, 1, 200) as description, books.slug as subtitle
      FROM chapters
      JOIN books ON books.id = chapters.book_id
      WHERE chapters.status = 'published' AND books.status = 'published' AND (chapters.title ILIKE ${queryPattern} OR chapters.body ILIKE ${queryPattern})
      
      LIMIT 30
    `);

    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Search query error:", err);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
