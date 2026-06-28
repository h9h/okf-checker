import { extractLinks } from "../../core/markdown-utils";
import type { Finding, Rule } from "../types";

export const relativeLinks: Rule = (ctx) => {
  if (ctx.file.kind === "index") return [];

  return extractLinks(ctx.doc.body)
    .filter((link) => link.kind === "relative")
    .map((link): Finding => ({
      path: ctx.file.relativePath,
      severity: "warning",
      rule: "relative-links",
      message: `relative link to '${link.url}' (prefer bundle-relative '/...' form)`,
    }));
};
