import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { parseConceptSource } from "./concept";

export type TypesListResult =
  | { kind: "inline"; types: string[] }
  | { kind: "file"; path: string; types: string[] }
  | { kind: "unset" };

const HEADING_LINE = /^#{1,6}\s+(.+?)\s*$/;

function extractHeadingTypes(body: string): string[] {
  const types: string[] = [];
  for (const line of body.split(/\r?\n/)) {
    const match = HEADING_LINE.exec(line);
    if (match) types.push(match[1]);
  }
  return types;
}

function looksLikePath(value: string): boolean {
  return value.endsWith(".md") || existsSync(value);
}

function loadFromFile(filePath: string): TypesListResult {
  const source = readFileSync(filePath, "utf8");
  const parsed = parseConceptSource(filePath, source);
  if (!parsed.ok) {
    throw new Error(`Failed to parse types file ${filePath}: ${parsed.error.message}`);
  }
  return { kind: "file", path: filePath, types: extractHeadingTypes(parsed.doc.body) };
}

export function loadTypesList(bundleDir: string, typesArg?: string): TypesListResult {
  if (typesArg !== undefined && !looksLikePath(typesArg)) {
    const types = typesArg
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return { kind: "inline", types };
  }

  if (typesArg !== undefined) {
    const filePath = isAbsolute(typesArg) ? typesArg : resolve(typesArg);
    if (!existsSync(filePath)) {
      throw new Error(`Types file not found: ${filePath}`);
    }
    return loadFromFile(filePath);
  }

  const defaultPath = resolve(bundleDir, "types.md");
  if (!existsSync(defaultPath)) {
    return { kind: "unset" };
  }
  return loadFromFile(defaultPath);
}
