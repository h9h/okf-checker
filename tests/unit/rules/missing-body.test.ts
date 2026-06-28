import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { missingBody } from "../../../src/rules/errors/missing-body";
import type { RuleContext } from "../../../src/rules/types";

function ctx(doc: ConceptDoc, kind: BundleFile["kind"] = "concept"): RuleContext {
  const file: BundleFile = { relativePath: doc.path, absolutePath: `/bundle/${doc.path}`, kind, isRoot: true };
  return { bundleRoot: "/bundle", file, doc };
}

describe("missingBody", () => {
  it("flags a concept with an empty body", () => {
    const findings = missingBody(ctx({ path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body: "" }));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe("missing-body");
  });

  it("flags a concept whose body is only whitespace", () => {
    const findings = missingBody(ctx({ path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body: "\n\n  \n" }));
    expect(findings).toHaveLength(1);
  });

  it("does not flag a concept with real body content", () => {
    const findings = missingBody(ctx({ path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body: "Some text." }));
    expect(findings).toHaveLength(0);
  });

  it("does not apply to index.md/log.md files", () => {
    const findings = missingBody(ctx({ path: "index.md", hasFrontmatter: false, frontmatter: {}, body: "" }, "index"));
    expect(findings).toHaveLength(0);
  });
});
