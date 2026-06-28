import type { Finding, Rule } from "../types";

export const reservedFrontmatter: Rule = (ctx) => {
  if (ctx.file.kind !== "index" && ctx.file.kind !== "log") return [];
  if (!ctx.doc.hasFrontmatter) return [];

  const isRootIndexOkfVersionException =
    ctx.file.kind === "index" &&
    ctx.file.isRoot &&
    Object.keys(ctx.doc.frontmatter).every((key) => key === "okf_version");

  if (isRootIndexOkfVersionException) return [];

  const finding: Finding = {
    path: ctx.file.relativePath,
    severity: "error",
    rule: "reserved-frontmatter",
    message: `${ctx.file.relativePath} must not contain frontmatter`,
  };
  return [finding];
};
