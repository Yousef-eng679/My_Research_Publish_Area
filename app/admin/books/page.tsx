import { db } from "@/lib/db";
import BookManager from "./BookManager";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  // Query all books with their chapters in a single query
  const allBooks = await db.query.books.findMany({
    with: {
      chapters: true,
    },
    orderBy: (books, { desc }) => [desc(books.publishedAt)],
  });

  return <BookManager initialBooks={allBooks} />;
}
