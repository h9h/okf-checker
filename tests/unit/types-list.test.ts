import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { loadTypesList } from "../../src/core/types-list";

const FIXTURE_DIR = join(import.meta.dir, "../fixtures/types-md-headings");

describe("loadTypesList", () => {
  it("parses an inline comma-separated list", () => {
    const result = loadTypesList("/irrelevant", "BigQuery Table, Playbook ,Reference");
    expect(result).toEqual({ kind: "inline", types: ["BigQuery Table", "Playbook", "Reference"] });
  });

  it("extracts heading-based types from a given file path", () => {
    const filePath = join(FIXTURE_DIR, "types.md");
    const result = loadTypesList("/irrelevant", filePath);
    expect(result.kind).toBe("file");
    if (result.kind === "file") {
      expect(result.types).toEqual(["BigQuery Table", "BigQuery Dataset", "Playbook"]);
    }
  });

  it("defaults to <bundle-dir>/types.md when no --types is given", () => {
    const result = loadTypesList(FIXTURE_DIR);
    expect(result.kind).toBe("file");
    if (result.kind === "file") {
      expect(result.types).toContain("Playbook");
    }
  });

  it("returns kind 'unset' when defaulting and no types.md exists", () => {
    const result = loadTypesList("/tmp/definitely-not-a-real-okf-bundle-dir-xyz");
    expect(result).toEqual({ kind: "unset" });
  });

  it("throws when an explicit file path is given but does not exist", () => {
    expect(() => loadTypesList(FIXTURE_DIR, "/no/such/types.md")).toThrow();
  });
});
