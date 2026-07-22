import Link from "next/link";
import { db, blogs, papers, books, chapters } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Query counts from database
  const [blogCountRes] = await db.select({ count: sql<number>`count(*)` }).from(blogs);
  const [paperCountRes] = await db.select({ count: sql<number>`count(*)` }).from(papers);
  const [bookCountRes] = await db.select({ count: sql<number>`count(*)` }).from(books);
  const [chapterCountRes] = await db.select({ count: sql<number>`count(*)` }).from(chapters);

  const stats = [
    { name: "Blog Posts", count: blogCountRes?.count || 0, href: "/admin/blog" },
    { name: "Research Papers", count: paperCountRes?.count || 0, href: "/admin/papers" },
    { name: "Books Published", count: bookCountRes?.count || 0, href: "/admin/books" },
    { name: "Chapters Written", count: chapterCountRes?.count || 0, href: "/admin/books" },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-text-primary">
          Library Management Dashboard
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Overview of your published digital assets and publishing controls.
        </p>
      </div>

      {/* Grid Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-border-muted bg-bg-surface p-6 transition-all duration-300 hover:border-green-accent"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">
              {stat.name}
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-text-primary font-sans">
                {stat.count}
              </span>
              <Link
                href={stat.href}
                className="text-xs font-mono text-green-accent hover:underline"
              >
                Manage &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links / Quick Start */}
      <div className="mt-8 border-t border-border-muted pt-8">
        <h2 className="font-sans text-lg font-bold text-text-primary mb-4">
          Publishing Shortcuts
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="p-6 rounded-xl border border-border-muted bg-bg-surface flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-text-primary">Write Blog Post</h3>
              <p className="text-xs text-text-secondary mt-1">
                Publish standard articles, dev logs, or general announcements.
              </p>
            </div>
            <Link
              href="/admin/blog?action=new"
              className="mt-6 inline-flex justify-center py-2 px-4 rounded border border-green-accent bg-green-dark/20 text-green-accent text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-colors duration-300"
            >
              + Create Post
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-border-muted bg-bg-surface flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-text-primary">Publish Research Paper</h3>
              <p className="text-xs text-text-secondary mt-1">
                Upload academic papers complete with abstracts, citations, and metadata.
              </p>
            </div>
            <Link
              href="/admin/papers?action=new"
              className="mt-6 inline-flex justify-center py-2 px-4 rounded border border-green-accent bg-green-dark/20 text-green-accent text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-colors duration-300"
            >
              + Create Paper
            </Link>
          </div>

          <div className="p-6 rounded-xl border border-border-muted bg-bg-surface flex flex-col justify-between">
            <div>
              <h3 className="font-sans font-bold text-text-primary">Manage Books</h3>
              <p className="text-xs text-text-secondary mt-1">
                Write serialized chapters or compile complete books with physical cover-lifts.
              </p>
            </div>
            <Link
              href="/admin/books?action=new"
              className="mt-6 inline-flex justify-center py-2 px-4 rounded border border-green-accent bg-green-dark/20 text-green-accent text-xs font-mono font-medium hover:bg-green-accent hover:text-bg-base transition-colors duration-300"
            >
              + Add Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
