import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { relativeLinks } from "../../../src/rules/warnings/relative-links";
import type { RuleContext } from "../../../src/rules/types";

function ctx(body: string, kind: BundleFile["kind"] = "concept"): RuleContext {
  const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind, isRoot: true };
  const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body };
  return { bundleRoot: "/bundle", file, doc };
}

describe("relativeLinks", () => {
  it("warns on a plain relative link", () => {
    const findings = relativeLinks(ctx("See [other](./other.md)."));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("./other.md");
  });

  it("does not warn on a bundle-relative absolute link", () => {
    expect(relativeLinks(ctx("See [other](/tables/other.md)."))).toHaveLength(0);
  });

  it("does not warn on an external link", () => {
    expect(relativeLinks(ctx("See [docs](https://example.com)."))).toHaveLength(0);
  });

  it("is exempt for index.md files", () => {
    expect(relativeLinks(ctx("See [other](./other.md).", "index"))).toHaveLength(0);
  });
});
