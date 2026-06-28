import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { unstructuredBody } from "../../../src/rules/warnings/unstructured-body";
import type { RuleContext } from "../../../src/rules/types";

function ctx(body: string): RuleContext {
  const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind: "concept", isRoot: true };
  const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body };
  return { bundleRoot: "/bundle", file, doc };
}

describe("unstructuredBody", () => {
  it("warns on prose with no headings", () => {
    expect(unstructuredBody(ctx("Just a wall of unstructured prose text."))).toHaveLength(1);
  });

  it("does not warn when a heading is present", () => {
    expect(unstructuredBody(ctx("# Schema\n\nSome text."))).toHaveLength(0);
  });

  it("does not warn on an empty body (missing-body error already covers it)", () => {
    expect(unstructuredBody(ctx(""))).toHaveLength(0);
  });
});
