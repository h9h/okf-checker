import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { unknownType } from "../../../src/rules/errors/unknown-type";
import type { RuleContext } from "../../../src/rules/types";

function ctx(frontmatter: Record<string, unknown>, permissibleTypes?: string[]): RuleContext {
  const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter, body: "Body." };
  const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind: "concept", isRoot: true };
  return { bundleRoot: "/bundle", file, doc, permissibleTypes };
}

describe("unknownType", () => {
  it("flags a type not present in the permissible list", () => {
    const findings = unknownType(ctx({ type: "Mystery" }, ["Playbook", "Reference"]));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe("unknown-type");
  });

  it("does not flag a type present in the permissible list", () => {
    const findings = unknownType(ctx({ type: "Playbook" }, ["Playbook", "Reference"]));
    expect(findings).toHaveLength(0);
  });

  it("does nothing when no permissible types list is configured", () => {
    const findings = unknownType(ctx({ type: "Anything" }, undefined));
    expect(findings).toHaveLength(0);
  });

  it("does not double-report when type is missing entirely (missing-type's job)", () => {
    const findings = unknownType(ctx({}, ["Playbook"]));
    expect(findings).toHaveLength(0);
  });
});
