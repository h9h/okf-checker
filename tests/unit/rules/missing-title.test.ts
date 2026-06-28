import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { missingTitle } from "../../../src/rules/warnings/missing-title";
import type { RuleContext } from "../../../src/rules/types";

function ctx(frontmatter: Record<string, unknown>): RuleContext {
  const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind: "concept", isRoot: true };
  const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter, body: "Body." };
  return { bundleRoot: "/bundle", file, doc };
}

describe("missingTitle", () => {
  it("warns when title is absent", () => {
    expect(missingTitle(ctx({}))).toHaveLength(1);
  });

  it("warns when title is an empty string", () => {
    expect(missingTitle(ctx({ title: "  " }))).toHaveLength(1);
  });

  it("does not warn when a title is present", () => {
    expect(missingTitle(ctx({ title: "Orders" }))).toHaveLength(0);
  });
});
