import test from "node:test";
import assert from "node:assert";
import { formatFriendlyDate, generateSlug, getBookProgressText } from "./utils";

test("Date Formatter - formatFriendlyDate", () => {
  // Test Date object
  const dateObj = new Date("2026-07-16T12:00:00Z");
  assert.strictEqual(formatFriendlyDate(dateObj), "July 16, 2026");

  // Test ISO string
  assert.strictEqual(formatFriendlyDate("2026-07-16"), "July 16, 2026");

  // Test slash string
  assert.strictEqual(formatFriendlyDate("07/16/2026"), "July 16, 2026");

  // Test invalid input gracefully
  assert.strictEqual(formatFriendlyDate("invalid-date"), "invalid-date");
});

test("Slug Generator - generateSlug", () => {
  // Basic lowercase and hyphen transition
  assert.strictEqual(generateSlug("Hello World"), "hello-world");

  // Trimming leading/trailing whitespace and hyphens
  assert.strictEqual(generateSlug("  Hello World  "), "hello-world");

  // Strip punctuation and special characters
  assert.strictEqual(generateSlug("Next.js 16: Dynamic Routing & Auth!"), "nextjs-16-dynamic-routing-auth");

  // Collapse multiple hyphens/spaces
  assert.strictEqual(generateSlug("Hello   ---   World"), "hello-world");

  // Empty string
  assert.strictEqual(generateSlug(""), "");
});

test("Serialization Progress - getBookProgressText", () => {
  // Scenario 1: No chapters at all
  assert.strictEqual(getBookProgressText(0, 0), "No chapters released");

  // Scenario 2: Chapters exist but none are published (drafts only)
  assert.strictEqual(getBookProgressText(0, 5), "Coming Soon (5 chapters in progress)");

  // Scenario 3: Partial chapters published
  assert.strictEqual(getBookProgressText(3, 5), "Chapter 3 of 5 released");

  // Scenario 4: All chapters published
  assert.strictEqual(getBookProgressText(5, 5), "Complete (5 chapters)");
});
