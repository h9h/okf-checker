import type { Finding, Rule } from "../types";

export const unknownType: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];
  if (!ctx.permissibleTypes) return [];

  const type = ctx.doc.frontmatter.type;
  if (typeof type !== "string" || type.trim().length === 0) return [];
  if (ctx.permissibleTypes.includes(type)) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "error",
    rule: "unknown-type",
    message: `type '${type}' is not in the permissible types list`,
  };
  return [finding];
};
