import { describe, expect, it } from "bun:test";
import { generateIndexMarkdown } from "../../src/generator/index-generator";

describe("generateIndexMarkdown", () => {
  it("produces empty content when there is nothing to list", () => {
    expect(generateIndexMarkdown({ subdirectories: [], concepts: [] })).toBe("");
  });

  it("renders a Subdirectories section and a Concepts section, alphabetically sorted", () => {
    const markdown = generateIndexMarkdown({
      subdirectories: [{ title: "tables", url: "tables/" }],
      concepts: [
        { title: "Orders", url: "orders.md", description: "One row per order." },
        { title: "Customers", url: "customers.md", description: "One row per customer." },
      ],
    });

    expect(markdown).toBe(
      [
        "# Subdirectories",
        "",
        "* [tables](tables/)",
        "",
        "# Concepts",
        "",
        "* [Customers](customers.md) - One row per customer.",
        "* [Orders](orders.md) - One row per order.",
      ].join("\n") + "\n"
    );
  });

  it("omits a section entirely when it has no entries", () => {
    const markdown = generateIndexMarkdown({
      subdirectories: [],
      concepts: [{ title: "Orders", url: "orders.md" }],
    });
    expect(markdown).not.toContain("# Subdirectories");
    expect(markdown).toContain("# Concepts");
  });

  it("prepends a preserved okf_version frontmatter block when given", () => {
    const markdown = generateIndexMarkdown({
      subdirectories: [],
      concepts: [{ title: "Orders", url: "orders.md" }],
      existingFrontmatter: 'okf_version: "0.1"',
    });
    expect(markdown.startsWith('---\nokf_version: "0.1"\n---\n\n')).toBe(true);
  });
});
