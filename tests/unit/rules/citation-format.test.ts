import { describe, expect, it } from "bun:test";
import type { BundleFile } from "../../../src/core/bundle-walker";
import type { ConceptDoc } from "../../../src/core/concept";
import { citationFormat } from "../../../src/rules/warnings/citation-format";
import type { RuleContext } from "../../../src/rules/types";

function ctx(body: string): RuleContext {
  const file: BundleFile = { relativePath: "a.md", absolutePath: "/bundle/a.md", kind: "concept", isRoot: true };
  const doc: ConceptDoc = { path: "a.md", hasFrontmatter: true, frontmatter: { type: "X" }, body };
  return { bundleRoot: "/bundle", file, doc };
}

describe("citationFormat", () => {
  it("does not warn when there are no citations at all", () => {
    expect(citationFormat(ctx("# Schema\n\nNo citations here."))).toHaveLength(0);
  });

  it("does not warn on a well-formed Citations section", () => {
    const body = "# Citations\n\n[1] [Source](https://example.com)\n[2] [Other](https://example.com/2)\n";
    expect(citationFormat(ctx(body))).toHaveLength(0);
  });

  it("warns on citation-like content outside a Citations heading", () => {
    const body = "Some claim.\n\n[1] [Stray](https://example.com)\n";
    const findings = citationFormat(ctx(body));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("outside a '# Citations' heading");
  });

  it("warns on non-sequential numbering within the Citations section", () => {
    const body = "# Citations\n\n[1] [Source](https://example.com)\n[3] [Other](https://example.com/2)\n";
    const findings = citationFormat(ctx(body));
    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain("out of sequence");
  });

  it("warns on malformed citation lines within the Citations section", () => {
    const body = "# Citations\n\n[1] Source - https://example.com\n";
    const findings = citationFormat(ctx(body));
    expect(findings).toHaveLength(1);
  });
});
