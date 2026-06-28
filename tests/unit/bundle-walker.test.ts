import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { walkBundle } from "../../src/core/bundle-walker";

const FIXTURE_ROOT = join(import.meta.dir, "../fixtures/valid-bundle");

describe("walkBundle", () => {
  it("finds all markdown files with correct relative paths", () => {
    const tree = walkBundle(FIXTURE_ROOT);
    const paths = tree.files.map((f) => f.relativePath).sort();
    expect(paths).toEqual(["index.md", "log.md", "tables/customers.md", "tables/index.md", "tables/orders.md"]);
  });

  it("classifies reserved filenames at any directory level", () => {
    const tree = walkBundle(FIXTURE_ROOT);
    const byPath = new Map(tree.files.map((f) => [f.relativePath, f]));
    expect(byPath.get("index.md")?.kind).toBe("index");
    expect(byPath.get("log.md")?.kind).toBe("log");
    expect(byPath.get("tables/index.md")?.kind).toBe("index");
    expect(byPath.get("tables/orders.md")?.kind).toBe("concept");
    expect(byPath.get("tables/customers.md")?.kind).toBe("concept");
  });

  it("flags root-level files with isRoot=true and nested files with isRoot=false", () => {
    const tree = walkBundle(FIXTURE_ROOT);
    const byPath = new Map(tree.files.map((f) => [f.relativePath, f]));
    expect(byPath.get("index.md")?.isRoot).toBe(true);
    expect(byPath.get("tables/orders.md")?.isRoot).toBe(false);
  });

  it("builds a directory tree with subdirectories and per-directory file lists", () => {
    const tree = walkBundle(FIXTURE_ROOT);
    const root = tree.directories.find((d) => d.relativePath === "");
    const tables = tree.directories.find((d) => d.relativePath === "tables");

    expect(root?.subdirectories).toEqual(["tables"]);
    expect(root?.files.map((f) => f.relativePath).sort()).toEqual(["index.md", "log.md"]);
    expect(tables?.subdirectories).toEqual([]);
    expect(tables?.files.map((f) => f.relativePath).sort()).toEqual([
      "tables/customers.md",
      "tables/index.md",
      "tables/orders.md",
    ]);
  });
});
