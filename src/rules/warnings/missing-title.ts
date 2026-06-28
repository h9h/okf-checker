import type { Finding, Rule } from "../types";

export const missingTitle: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];

  const title = ctx.doc.frontmatter.title;
  if (typeof title === "string" && title.trim().length > 0) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "warning",
    rule: "missing-title",
    message: "no title given",
  };
  return [finding];
};
