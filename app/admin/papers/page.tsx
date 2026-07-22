import { db, papers } from "@/lib/db";
import { desc } from "drizzle-orm";
import PaperManager from "./PaperManager";

export const dynamic = "force-dynamic";

export default async function AdminPapersPage() {
  // Query all research papers
  const allPapers = await db
    .select()
    .from(papers)
    .orderBy(desc(papers.publishedAt));

  return <PaperManager initialPapers={allPapers} />;
}
