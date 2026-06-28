import { hasAnyHeading } from "../../core/markdown-utils";
import type { Finding, Rule } from "../types";

export const unstructuredBody: Rule = (ctx) => {
  if (ctx.file.kind !== "concept") return [];
  if (ctx.doc.body.trim().length === 0) return [];
  if (hasAnyHeading(ctx.doc.body)) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "warning",
    rule: "unstructured-body",
    message: "body contains no markdown headings",
  };
  return [finding];
};
