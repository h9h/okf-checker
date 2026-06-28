import { afterEach, describe, expect, it } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { notAGitRepo } from "../../../src/rules/warnings/not-a-git-repo";

let tempDir: string | undefined;

afterEach(() => {
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  tempDir = undefined;
});

describe("notAGitRepo", () => {
  it("warns when the bundle root has no .git directory", () => {
    tempDir = mkdtempSync(join(tmpdir(), "okf-checker-"));
    expect(notAGitRepo(tempDir)).toHaveLength(1);
  });

  it("does not warn when the bundle root has a .git directory", () => {
    tempDir = mkdtempSync(join(tmpdir(), "okf-checker-"));
    mkdirSync(join(tempDir, ".git"));
    expect(notAGitRepo(tempDir)).toHaveLength(0);
  });
});
