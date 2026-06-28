import type { Finding, Rule } from "../types";

export const missingType: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];

  const type = ctx.doc.frontmatter.type;
  if (typeof type === "string" && type.trim().length > 0) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "error",
    rule: "missing-type",
    message: "missing 'type' field in frontmatter",
  };
  return [finding];
};
