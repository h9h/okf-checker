import { extractCitationsSection, findCitationLikeLines, validateCitationsSection } from "../../core/markdown-utils";
import type { Finding, Rule } from "../types";

export const citationFormat: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];

  const section = extractCitationsSection(ctx.doc.body);

  if (!section) {
    const stray = findCitationLikeLines(ctx.doc.body);
    if (stray.length === 0) return [];
    const finding: Finding = {
      path: ctx.file.relativePath,
      severity: "warning",
      rule: "citation-format",
      message: "citation-like content found outside a '# Citations' heading",
    };
    return [finding];
  }

  const { valid, issues } = validateCitationsSection(section.lines);
  if (valid) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "warning",
    rule: "citation-format",
    message: `improper citation format: ${issues.join("; ")}`,
  };
  return [finding];
};
