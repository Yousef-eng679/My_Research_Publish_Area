import { NextResponse } from "next/server";
import { db, books, chapters } from "@/lib/db";
import { eq, asc, and } from "drizzle-orm";
import { generateEpub } from "@/lib/epub";

export const dynamic = "force-dynamic";

interface EpubRouteProps {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: EpubRouteProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  try {
    // 1. Fetch book details
    const fetchedBooks = await db
      .select()
      .from(books)
      .where(eq(books.slug, slug))
      .limit(1);

    if (fetchedBooks.length === 0 || fetchedBooks[0].status !== "published") {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const book = fetchedBooks[0];

    // 2. Fetch only published chapters for the book
    const bookChapters = await db
      .select()
      .from(chapters)
      .where(
        and(
          eq(chapters.bookId, book.id),
          eq(chapters.status, "published")
        )
      )
      .orderBy(asc(chapters.orderIndex));

    if (bookChapters.length === 0) {
      return NextResponse.json({ error: "No published chapters found for this book" }, { status: 400 });
    }

    // 3. Compile chapters into EPUB format
    const epubBuffer = await generateEpub({
      title: book.title,
      author: "Admin", // default single author
      description: book.description,
      chapters: bookChapters.map((ch) => ({
        title: ch.title,
        body: ch.body,
        orderIndex: ch.orderIndex,
      })),
    });

    // 4. Return as download attachment
    const response = new NextResponse(new Uint8Array(epubBuffer), {
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${slug}.epub"`,
      },
    });

    return response;
  } catch (err) {
    console.error("EPUB compilation API error:", err);
    return NextResponse.json({ error: "Failed to compile EPUB volume" }, { status: 500 });
  }
}
