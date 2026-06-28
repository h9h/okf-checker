import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { missingType } from "../../../src/rules/errors/missing-type";
import type { RuleContext } from "../../../src/rules/types";

function ctx(overrides: Partial<RuleContext>): RuleContext {
  const file: BundleFile = {
    relativePath: "concept.md",
    absolutePath: "/bundle/concept.md",
    kind: "concept",
    isRoot: true,
  };
  const doc: ConceptDoc = { path: "concept.md", hasFrontmatter: true, frontmatter: {}, body: "Body." };
  return { bundleRoot: "/bundle", file, doc, ...overrides };
}

describe("missingType", () => {
  it("flags a concept with no frontmatter at all", () => {
    const findings = missingType(ctx({ doc: { path: "concept.md", hasFrontmatter: false, frontmatter: {}, body: "Body." } }));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe("missing-type");
  });

  it("flags a concept whose frontmatter has no type field", () => {
    const findings = missingType(ctx({}));
    expect(findings).toHaveLength(1);
  });

  it("flags a concept whose type field is an empty string", () => {
    const findings = missingType(
      ctx({ doc: { path: "concept.md", hasFrontmatter: true, frontmatter: { type: "  " }, body: "Body." } })
    );
    expect(findings).toHaveLength(1);
  });

  it("does not flag a concept with a non-empty type field", () => {
    const findings = missingType(
      ctx({ doc: { path: "concept.md", hasFrontmatter: true, frontmatter: { type: "Playbook" }, body: "Body." } })
    );
    expect(findings).toHaveLength(0);
  });

  it("does not apply to index.md/log.md files", () => {
    const findings = missingType(
      ctx({ file: { relativePath: "index.md", absolutePath: "/bundle/index.md", kind: "index", isRoot: true } })
    );
    expect(findings).toHaveLength(0);
  });
});
