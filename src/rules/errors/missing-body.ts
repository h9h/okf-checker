import type { Finding, Rule } from "../types";

export const missingBody: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];
  if (ctx.doc.body.trim().length > 0) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "error",
    rule: "missing-body",
    message: "concept document has no body content",
  };
  return [finding];
};
