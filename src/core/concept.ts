import matter from "gray-matter";
import { readFileSync } from "node:fs";

export interface ConceptDoc {
  path: string;
  hasFrontmatter: boolean;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ConceptParseError {
  path: string;
  message: string;
}

export type ConceptParseResult =
  | { ok: true; doc: ConceptDoc }
  | { ok: false; error: ConceptParseError };

const FRONTMATTER_START = /^---\r?\n/;

export function parseConceptSource(path: string, source: string): ConceptParseResult {
  const hasFrontmatter = FRONTMATTER_START.test(source);

  try {
    const parsed = matter(source);
    return {
      ok: true,
      doc: {
        path,
        hasFrontmatter,
        frontmatter: parsed.data as Record<string, unknown>,
        body: parsed.content,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: { path, message: err instanceof Error ? err.message : String(err) },
    };
  }
}

export function parseConceptFile(path: string): ConceptParseResult {
  const source = readFileSync(path, "utf8");
  return parseConceptSource(path, source);
}
