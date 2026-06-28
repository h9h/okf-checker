import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { reservedFrontmatter } from "../../../src/rules/errors/reserved-frontmatter";
import type { RuleContext } from "../../../src/rules/types";

function ctx(file: BundleFile, doc: ConceptDoc): RuleContext {
  return { bundleRoot: "/bundle", file, doc };
}

describe("reservedFrontmatter", () => {
  it("flags a non-root index.md with frontmatter", () => {
    const file: BundleFile = { relativePath: "tables/index.md", absolutePath: "/bundle/tables/index.md", kind: "index", isRoot: false };
    const doc: ConceptDoc = { path: "tables/index.md", hasFrontmatter: true, frontmatter: { okf_version: "0.1" }, body: "" };
    const findings = reservedFrontmatter(ctx(file, doc));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe("reserved-frontmatter");
  });

  it("flags log.md with frontmatter at any level", () => {
    const file: BundleFile = { relativePath: "log.md", absolutePath: "/bundle/log.md", kind: "log", isRoot: true };
    const doc: ConceptDoc = { path: "log.md", hasFrontmatter: true, frontmatter: {}, body: "" };
    const findings = reservedFrontmatter(ctx(file, doc));
    expect(findings).toHaveLength(1);
  });

  it("allows a root index.md with frontmatter containing only okf_version", () => {
    const file: BundleFile = { relativePath: "index.md", absolutePath: "/bundle/index.md", kind: "index", isRoot: true };
    const doc: ConceptDoc = { path: "index.md", hasFrontmatter: true, frontmatter: { okf_version: "0.1" }, body: "" };
    const findings = reservedFrontmatter(ctx(file, doc));
    expect(findings).toHaveLength(0);
  });

  it("flags a root index.md with frontmatter containing keys beyond okf_version", () => {
    const file: BundleFile = { relativePath: "index.md", absolutePath: "/bundle/index.md", kind: "index", isRoot: true };
    const doc: ConceptDoc = { path: "index.md", hasFrontmatter: true, frontmatter: { okf_version: "0.1", title: "Root" }, body: "" };
    const findings = reservedFrontmatter(ctx(file, doc));
    expect(findings).toHaveLength(1);
  });

  it("does not flag index.md/log.md without any frontmatter", () => {
    const file: BundleFile = { relativePath: "index.md", absolutePath: "/bundle/index.md", kind: "index", isRoot: true };
    const doc: ConceptDoc = { path: "index.md", hasFrontmatter: false, frontmatter: {}, body: "" };
    const findings = reservedFrontmatter(ctx(file, doc));
    expect(findings).toHaveLength(0);
  });

  it("does not apply to concept files", () => {
    const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind: "concept", isRoot: true };
    const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body: "Body." };
    const findings = reservedFrontmatter(ctx(file, doc));
    expect(findings).toHaveLength(0);
  });
});
