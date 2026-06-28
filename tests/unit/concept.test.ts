import { describe, expect, it } from "bun:test";
import { parseConceptSource } from "../../src/core/concept";

describe("parseConceptSource", () => {
  it("parses a well-formed concept with frontmatter and body", () => {
    const source = `---\ntype: Playbook\ntitle: Example\n---\n\n# Heading\n\nBody text.\n`;
    const result = parseConceptSource("foo.md", source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.doc.hasFrontmatter).toBe(true);
      expect(result.doc.frontmatter.type).toBe("Playbook");
      expect(result.doc.frontmatter.title).toBe("Example");
      expect(result.doc.body).toContain("# Heading");
    }
  });

  it("reports hasFrontmatter=false and empty frontmatter when no block is present", () => {
    const source = `# Just a heading\n\nSome body text with no frontmatter.\n`;
    const result = parseConceptSource("foo.md", source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.doc.hasFrontmatter).toBe(false);
      expect(result.doc.frontmatter).toEqual({});
      expect(result.doc.body).toBe(source);
    }
  });

  it("reports hasFrontmatter=true even when the type field is missing", () => {
    const source = `---\ntitle: No type here\n---\n\nBody.\n`;
    const result = parseConceptSource("foo.md", source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.doc.hasFrontmatter).toBe(true);
      expect(result.doc.frontmatter.type).toBeUndefined();
    }
  });

  it("returns a typed parse error for malformed YAML frontmatter", () => {
    const source = `---\ntype: [unclosed\n---\n\nBody.\n`;
    const result = parseConceptSource("foo.md", source);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.path).toBe("foo.md");
      expect(result.error.message.length).toBeGreaterThan(0);
    }
  });

  it("treats an empty body as an empty string after trimming", () => {
    const source = `---\ntype: Reference\n---\n`;
    const result = parseConceptSource("foo.md", source);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.doc.body.trim()).toBe("");
    }
  });
});
