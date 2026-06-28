import { afterEach, describe, expect, it } from "bun:test";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../src/cli";

const FIXTURES = join(import.meta.dir, "fixtures");

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe("cli", () => {
  it("returns 0 and prints usage for --help", async () => {
    expect(await main(["--help"])).toBe(0);
  });

  it("returns 2 when no command is given", async () => {
    expect(await main([])).toBe(2);
  });

  it("returns 2 for an unknown command", async () => {
    expect(await main(["bogus"])).toBe(2);
  });

  it("returns 2 when check is given no bundle directory", async () => {
    expect(await main(["check"])).toBe(2);
  });

  it("returns 2 when check is given a nonexistent bundle directory", async () => {
    expect(await main(["check", "/no/such/bundle/dir"])).toBe(2);
  });

  it("returns 0 for check against a conformant bundle", async () => {
    expect(await main(["check", join(FIXTURES, "valid-bundle")])).toBe(0);
  });

  it("returns 1 for check against a bundle with conformance errors", async () => {
    expect(await main(["check", join(FIXTURES, "missing-type")])).toBe(1);
  });

  it("supports --json output without changing the exit code", async () => {
    expect(await main(["check", join(FIXTURES, "valid-bundle"), "--json"])).toBe(0);
  });

  it("returns 0 and writes index.md files for generate-index against a temp copy", async () => {
    tempDir = mkdtempSync(join(tmpdir(), "okf-checker-cli-"));
    cpSync(join(FIXTURES, "valid-bundle"), tempDir, { recursive: true });
    expect(await main(["generate-index", tempDir])).toBe(0);
    expect(existsSync(join(tempDir, "index.md"))).toBe(true);
  });
});
