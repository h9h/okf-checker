import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { missingDescription } from "../../../src/rules/warnings/missing-description";
import type { RuleContext } from "../../../src/rules/types";

function ctx(frontmatter: Record<string, unknown>): RuleContext {
  const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind: "concept", isRoot: true };
  const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter, body: "Body." };
  return { bundleRoot: "/bundle", file, doc };
}

describe("missingDescription", () => {
  it("warns when description is absent", () => {
    expect(missingDescription(ctx({}))).toHaveLength(1);
  });

  it("does not warn when a description is present", () => {
    expect(missingDescription(ctx({ description: "Summary." }))).toHaveLength(0);
  });
});
