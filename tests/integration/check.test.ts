import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { runCheck } from "../../src/commands/check";
import { buildReport } from "../../src/report/reporter";
import { exitCodeForReport } from "../../src/report/exit-code";

const FIXTURES = join(import.meta.dir, "../fixtures");

function rulesFor(findings: ReturnType<typeof runCheck>, path: string): string[] {
  return findings.filter((f) => f.path === path).map((f) => f.rule);
}

describe("runCheck integration", () => {
  it("valid-bundle has no errors (only the expected not-a-git-repo warning)", () => {
    const findings = runCheck(join(FIXTURES, "valid-bundle"));
    const report = buildReport(findings);
    expect(report.summary.errors).toBe(0);
    expect(exitCodeForReport(report)).toBe(0);
    expect(findings.some((f) => f.rule === "not-a-git-repo")).toBe(true);
  });

  it("missing-type fixture flags missing-type as an error", () => {
    const findings = runCheck(join(FIXTURES, "missing-type"));
    const report = buildReport(findings);
    expect(rulesFor(findings, "foo.md")).toContain("missing-type");
    expect(exitCodeForReport(report)).toBe(1);
  });

  it("missing-body fixture flags missing-body as an error", () => {
    const findings = runCheck(join(FIXTURES, "missing-body"));
    expect(rulesFor(findings, "empty.md")).toContain("missing-body");
  });

  it("unknown-type fixture flags unknown-type as an error using the bundle's default types.md", () => {
    const findings = runCheck(join(FIXTURES, "unknown-type"));
    expect(rulesFor(findings, "widget.md")).toContain("unknown-type");
    expect(rulesFor(findings, "types.md")).not.toContain("unknown-type");
  });

  it("reserved-frontmatter fixture flags both root and nested index.md with disallowed frontmatter", () => {
    const findings = runCheck(join(FIXTURES, "reserved-frontmatter"));
    expect(rulesFor(findings, "index.md")).toContain("reserved-frontmatter");
    expect(rulesFor(findings, "sub/index.md")).toContain("reserved-frontmatter");
  });

  it("warnings-bundle fixture flags missing-title, missing-description, unstructured-body, and relative-links", () => {
    const findings = runCheck(join(FIXTURES, "warnings-bundle"));
    const noteRules = rulesFor(findings, "note.md");
    expect(noteRules).toContain("missing-title");
    expect(noteRules).toContain("missing-description");
    expect(noteRules).toContain("unstructured-body");
    expect(noteRules).toContain("relative-links");
    const report = buildReport(findings);
    expect(report.summary.errors).toBe(0);
  });

  it("citation-formats fixture flags stray citations and non-sequential numbering", () => {
    const findings = runCheck(join(FIXTURES, "citation-formats"));
    expect(rulesFor(findings, "stray.md")).toContain("citation-format");
    expect(rulesFor(findings, "bad-sequence.md")).toContain("citation-format");
  });
});
