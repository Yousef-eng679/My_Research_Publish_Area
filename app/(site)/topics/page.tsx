import Link from "next/link";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import SpotlightCard from "@/components/SpotlightCard";

export const dynamic = "force-dynamic";

export default async function TopicsPage() {
  let topicsList: Array<{ topic: string; count: number }> = [];

  try {
    // Unnest tags from all content tables and group them with count
    const result = await db.execute(sql`
      SELECT topic, count(*)::int as count 
      FROM (
        SELECT unnest(topics) as topic FROM blogs WHERE status = 'published'
        UNION ALL
        SELECT unnest(topics) as topic FROM papers WHERE status = 'published'
        UNION ALL
        SELECT unnest(topics) as topic FROM books WHERE status = 'published'
      ) t
      GROUP BY topic
      ORDER BY count DESC, topic ASC
    `);
    
    topicsList = (result.rows as unknown as Array<{ topic: string; count: number }>) || [];
  } catch (err) {
    console.error("Failed to query unique taxonomy topics:", err);
  }

  return (
    <div className="relative overflow-hidden py-16">
      {/* Background Radial Glow */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-green-accent/5 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="border-b border-border-muted pb-6">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text-primary">
            Explore Topics
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Cross-reference and browse all content types by subject tags.
          </p>
        </div>

        {/* Topics grid */}
        {topicsList.length === 0 ? (
          <div className="rounded-xl border border-border-muted bg-bg-surface p-12 text-center">
            <p className="font-mono text-sm text-text-secondary">
              No subjects have been tagged in the library yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {topicsList.map(({ topic, count }) => (
              <Link key={topic} href={`/topics/${topic}`} className="block">
                <SpotlightCard className="p-5 flex items-center justify-between hover:border-green-accent transition-colors duration-300">
                  <div className="space-y-1">
                    <span className="font-mono text-sm font-bold text-text-primary hover:text-green-accent transition-colors duration-300">
                      #{topic}
                    </span>
                    <p className="text-[10px] font-mono text-text-secondary">
                      {count} {count === 1 ? "publication" : "publications"}
                    </p>
                  </div>
                  <div className="h-6 w-6 rounded bg-green-dark/30 border border-green-accent/20 flex items-center justify-center font-mono text-xs text-green-accent">
                    &rarr;
                  </div>
                </SpotlightCard>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
