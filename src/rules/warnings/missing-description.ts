import type { Finding, Rule } from "../types";

export const missingDescription: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];

  const description = ctx.doc.frontmatter.description;
  if (typeof description === "string" && description.trim().length > 0) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "warning",
    rule: "missing-description",
    message: "no description given",
  };
  return [finding];
};
