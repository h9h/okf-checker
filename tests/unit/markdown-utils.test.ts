import { describe, expect, it } from "bun:test";
import {
  extractCitationsSection,
  extractLinks,
  findCitationLikeLines,
  hasAnyHeading,
  validateCitationsSection,
} from "../../src/core/markdown-utils";

describe("hasAnyHeading", () => {
  it("detects a heading anywhere in the body", () => {
    expect(hasAnyHeading("Intro text\n\n## Schema\n\nMore text.")).toBe(true);
  });

  it("returns false when there are no headings", () => {
    expect(hasAnyHeading("Just a paragraph of prose with no structure at all.")).toBe(false);
  });

  it("does not treat a bare '#' without following text as a heading", () => {
    expect(hasAnyHeading("#nottag\n\nplain text")).toBe(false);
  });
});

describe("extractLinks", () => {
  it("classifies absolute bundle-relative links", () => {
    const links = extractLinks("See the [customers table](/tables/customers.md).");
    expect(links).toEqual([{ text: "customers table", url: "/tables/customers.md", kind: "absolute" }]);
  });

  it("classifies relative links", () => {
    const links = extractLinks("See [other](./other.md) and [sibling](sibling.md).");
    expect(links.map((l) => l.kind)).toEqual(["relative", "relative"]);
  });

  it("classifies external links", () => {
    const links = extractLinks("See [docs](https://example.com/docs).");
    expect(links[0]?.kind).toBe("external");
  });

  it("classifies anchor links", () => {
    const links = extractLinks("See [section](#schema).");
    expect(links[0]?.kind).toBe("anchor");
  });
});

describe("extractCitationsSection", () => {
  it("returns null when there is no Citations heading", () => {
    expect(extractCitationsSection("# Schema\n\nNo citations here.")).toBeNull();
  });

  it("extracts lines under a # Citations heading up to the next heading", () => {
    const body = "# Schema\n\nStuff.\n\n# Citations\n\n[1] [Source](https://example.com)\n[2] [Other](https://example.com/2)\n\n# Appendix\nignored";
    const section = extractCitationsSection(body);
    expect(section?.lines).toEqual(["[1] [Source](https://example.com)", "[2] [Other](https://example.com/2)"]);
  });
});

describe("findCitationLikeLines", () => {
  it("finds citation-shaped lines anywhere in the body", () => {
    const body = "Some prose.\n\n[1] [Stray citation](https://example.com)\n\nMore prose.";
    expect(findCitationLikeLines(body)).toEqual(["[1] [Stray citation](https://example.com)"]);
  });
});

describe("validateCitationsSection", () => {
  it("accepts sequential, well-formed citation lines", () => {
    const result = validateCitationsSection(["[1] [A](https://a.com)", "[2] [B](https://b.com)"]);
    expect(result).toEqual({ valid: true, issues: [] });
  });

  it("flags non-sequential numbering", () => {
    const result = validateCitationsSection(["[1] [A](https://a.com)", "[3] [B](https://b.com)"]);
    expect(result.valid).toBe(false);
  });

  it("flags malformed lines", () => {
    const result = validateCitationsSection(["[1] A - https://a.com"]);
    expect(result.valid).toBe(false);
  });
});
