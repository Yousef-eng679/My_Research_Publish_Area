import { GET as getBlogRss } from "@/app/blog/rss.xml/route";

export const dynamic = "force-dynamic";

export async function GET() {
  return getBlogRss();
}
