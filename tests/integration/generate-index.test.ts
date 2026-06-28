import { afterEach, describe, expect, it } from "bun:test";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runGenerateIndex } from "../../src/commands/generate-index";

const FIXTURES = join(import.meta.dir, "../fixtures");

let tempDir: string | undefined;

function copyFixture(name: string): string {
  const dir = mkdtempSync(join(tmpdir(), "okf-checker-genindex-"));
  cpSync(join(FIXTURES, name), dir, { recursive: true });
  tempDir = dir;
  return dir;
}

afterEach(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe("runGenerateIndex", () => {
  it("writes an index.md per directory with subdirectory and concept sections", async () => {
    const dir = copyFixture("valid-bundle");
    const result = await runGenerateIndex(dir, { overwrite: true });

    expect(result.written.sort()).toEqual(["index.md", "tables/index.md"]);
    expect(result.skipped).toEqual([]);

    const rootIndex = readFileSync(join(dir, "index.md"), "utf8");
    expect(rootIndex).toContain("# Subdirectories");
    expect(rootIndex).toContain("* [tables](tables/)");

    const tablesIndex = readFileSync(join(dir, "tables", "index.md"), "utf8");
    expect(tablesIndex).toContain("# Concepts");
    expect(tablesIndex).toContain("* [Customers](customers.md) - One row per customer.");
    expect(tablesIndex).toContain("* [Orders](orders.md) - One row per completed customer order.");
  });

  it("preserves an existing okf_version frontmatter on the root index.md when regenerating", async () => {
    const dir = copyFixture("valid-bundle");
    writeFileSync(join(dir, "index.md"), '---\nokf_version: "0.1"\n---\n\nold content\n');

    await runGenerateIndex(dir, { overwrite: true });

    const rootIndex = readFileSync(join(dir, "index.md"), "utf8");
    expect(rootIndex.startsWith('---\nokf_version: "0.1"\n---\n\n')).toBe(true);
    expect(rootIndex).toContain("# Subdirectories");
  });

  it("skips existing files under --no-overwrite in a non-TTY context, exits cleanly", async () => {
    const dir = copyFixture("valid-bundle");
    writeFileSync(join(dir, "index.md"), "untouched\n");

    const result = await runGenerateIndex(dir, { overwrite: false, isTTY: false });

    expect(result.skipped).toContain("index.md");
    expect(readFileSync(join(dir, "index.md"), "utf8")).toBe("untouched\n");
  });

  it("respects an injected overwrite prompt in a simulated TTY context", async () => {
    const dir = copyFixture("valid-bundle");
    writeFileSync(join(dir, "index.md"), "untouched\n");

    const result = await runGenerateIndex(dir, {
      overwrite: false,
      isTTY: true,
      promptOverwrite: async () => true,
    });

    expect(result.written).toContain("index.md");
    expect(readFileSync(join(dir, "index.md"), "utf8")).not.toBe("untouched\n");
  });
});
