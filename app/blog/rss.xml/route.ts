import { NextResponse } from "next/server";
import { db, blogs } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://antigravity-library.vercel.app";
  let rssFeed = "";

  try {
    // Query published blogs sorted by date
    const dbBlogs = await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, "published"))
      .orderBy(desc(blogs.publishedAt));

    const rssItems = dbBlogs
      .map((post) => `
        <item>
          <title>${escapeXml(post.title)}</title>
          <link>${baseUrl}/blog/${post.slug}</link>
          <guid>${baseUrl}/blog/${post.slug}</guid>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
          <description>${escapeXml(post.summary)}</description>
        </item>
      `)
      .join("");

    rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Antigravity Library Blog</title>
          <link>${baseUrl}/blog</link>
          <description>Chronological thoughts, engineering notes, and reviews</description>
          <atom:link href="${baseUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
          <language>en-us</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${rssItems}
        </channel>
      </rss>
    `.trim();
  } catch (err) {
    console.error("RSS creation error:", err);
    rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
      <rss version="2.0">
        <channel>
          <title>Antigravity Library Blog</title>
          <link>${baseUrl}/blog</link>
          <description>An error occurred building the feed.</description>
        </channel>
      </rss>`;
  }

  return new NextResponse(rssFeed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}
