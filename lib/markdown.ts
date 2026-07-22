import { marked } from "marked";
import { sanitizeHtmlContent } from "@/lib/securityUtils";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Custom renderer to automatically add ids to headings
const renderer = new marked.Renderer();
renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
  // Strip any inline HTML tags to get raw text for id slugification
  const rawText = text.replace(/<[^>]*>/g, "");
  const id = rawText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return `<h${depth} id="${id}">${text}</h${depth}>`;
};

/**
 * Compiles plain markdown text to HTML, adding anchor ids to headers
 */
export function compileMarkdown(markdownText: string): string {
  if (!markdownText) return "";
  try {
    const rawHtml = marked.parse(markdownText, {
      renderer,
      gfm: true,
      breaks: true,
      async: false,
    }) as string;

    return sanitizeHtmlContent(rawHtml);
  } catch (err) {
    console.error("Markdown compilation error:", err);
    return sanitizeHtmlContent(markdownText);
  }
}

/**
 * Compiles markdown text and substitutes reference keys like [Smith 2024]
 * with HTML CSS-only tooltips.
 */
export function compileMarkdownWithCitations(
  body: string,
  citations: Array<{ author: string; year: string; title: string; url?: string }>
): string {
  let compiledHtml = compileMarkdown(body);
  if (!citations || citations.length === 0) return compiledHtml;

  citations.forEach((cite, index) => {
    // Extract last name of primary author for lookup key, e.g., "Smith, J." -> "Smith"
    const authorLastName = cite.author.split(",")[0].trim();
    const citationKey = `${authorLastName} ${cite.year}`;
    
    // Create a regular expression matching [Smith 2024] (case-insensitive)
    const regex = new RegExp(`\\[${citationKey}\\]`, "gi");
    
    // CSS tooltips using Tailwind classes: absolute hover container
    const citationHtml = `
      <span class="group relative inline-block cursor-help font-mono text-xs text-green-accent">
        <a href="#reference-${index}" class="hover:underline">[${citationKey}]</a>
        <span class="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-64 -translate-x-1/2 rounded-lg border border-border-muted bg-bg-surface p-3 text-xs text-text-body shadow-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 leading-normal">
          <span class="block font-bold text-text-primary">${cite.author} (${cite.year})</span>
          <span class="block mt-1 italic text-text-secondary">${cite.title}</span>
          ${
            cite.url
              ? `<span class="block mt-1 text-[10px] text-green-accent underline truncate">${cite.url}</span>`
              : ""
          }
        </span>
      </span>
    `.trim();
    
    compiledHtml = compiledHtml.replace(regex, citationHtml);
  });

  return compiledHtml;
}

/**
 * Extracts ## and ### headers from markdown to construct a Table of Contents
 */
export function generateToc(markdownText: string): TocItem[] {
  if (!markdownText) return [];
  const headingRegex = /^(##|###)\s+(.+)$/gm;
  const toc: TocItem[] = [];
  let match;

  // We clone the regex search on the string
  while ((match = headingRegex.exec(markdownText)) !== null) {
    const level = match[1].length; // ## is 2, ### is 3
    const text = match[2].trim().replace(/<[^>]*>/g, ""); // strip any html
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    toc.push({ id, text, level });
  }

  return toc;
}
