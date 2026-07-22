/**
 * Simple parser to extract frontmatter metadata and body from raw Markdown text.
 */
export interface ParsedMarkdown {
  metadata: {
    title?: string;
    summary?: string;
    topics?: string[];
    [key: string]: any;
  };
  body: string;
}

export function parseMarkdownWithFrontmatter(content: string): ParsedMarkdown {
  const result: ParsedMarkdown = {
    metadata: {},
    body: content,
  };

  const trimmed = content.trim();
  if (!trimmed.startsWith("---")) {
    return result;
  }

  // Find closing boundary of frontmatter
  const lines = content.split("\n");
  let closingIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      closingIndex = i;
      break;
    }
  }

  if (closingIndex === -1) {
    return result;
  }

  const frontmatterLines = lines.slice(1, closingIndex);
  const bodyLines = lines.slice(closingIndex + 1);

  // Parse key-value pairs from frontmatter
  frontmatterLines.forEach((line) => {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) return;

    const key = line.substring(0, separatorIndex).trim();
    let valStr = line.substring(separatorIndex + 1).trim();

    // Parse arrays like [a, b, c]
    if (valStr.startsWith("[") && valStr.endsWith("]")) {
      const items = valStr
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, "")) // strip quotes
        .filter((item) => item !== "");
      result.metadata[key] = items;
    } else {
      // strip quotes if any
      const cleanedVal = valStr.replace(/^["']|["']$/g, "");
      result.metadata[key] = cleanedVal;
    }
  });

  result.body = bodyLines.join("\n").trim();
  return result;
}
