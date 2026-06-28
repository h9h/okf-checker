export function hasAnyHeading(body: string): boolean {
  return /^#{1,6}\s+\S/m.test(body);
}

export type LinkKind = "absolute" | "relative" | "external" | "anchor";

export interface MarkdownLink {
  text: string;
  url: string;
  kind: LinkKind;
}

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g;
const URI_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

function classifyLink(url: string): LinkKind {
  if (URI_SCHEME_RE.test(url)) return "external";
  if (url.startsWith("/")) return "absolute";
  if (url.startsWith("#")) return "anchor";
  return "relative";
}

export function extractLinks(body: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  for (const match of body.matchAll(LINK_RE)) {
    const text = match[1] ?? "";
    const url = match[2] ?? "";
    links.push({ text, url, kind: classifyLink(url) });
  }
  return links;
}

export interface CitationsSection {
  lines: string[];
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*$/;

export function extractCitationsSection(body: string): CitationsSection | null {
  const lines = body.split(/\r?\n/);

  let startIdx = -1;
  let headingLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const match = HEADING_RE.exec(lines[i] ?? "");
    if (match && match[2]?.trim() === "Citations") {
      startIdx = i + 1;
      headingLevel = match[1]?.length ?? 1;
      break;
    }
  }
  if (startIdx === -1) return null;

  const sectionLines: string[] = [];
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const match = HEADING_RE.exec(line);
    if (match && (match[1]?.length ?? 99) <= headingLevel) break;
    if (line.trim().length > 0) sectionLines.push(line.trim());
  }
  return { lines: sectionLines };
}

const CITATION_LINE_RE = /^\[(\d+)\]\s+\[[^\]]*\]\([^)]*\)\s*$/;
const CITATION_LIKE_RE = /^\[\d+\]\s*\[[^\]]*\]\([^)]*\)/;

export function findCitationLikeLines(body: string): string[] {
  return body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => CITATION_LIKE_RE.test(line));
}

export function validateCitationsSection(lines: string[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  lines.forEach((line, idx) => {
    const expectedNumber = idx + 1;
    const match = CITATION_LINE_RE.exec(line);
    if (!match) {
      issues.push(`malformed citation line: "${line}"`);
      return;
    }
    const num = Number(match[1]);
    if (num !== expectedNumber) {
      issues.push(`citation numbered [${num}] out of sequence (expected [${expectedNumber}])`);
    }
  });
  return { valid: issues.length === 0, issues };
}
