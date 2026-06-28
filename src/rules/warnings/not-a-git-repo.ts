import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Finding } from "../types";

export function notAGitRepo(bundleRoot: string): Finding[] {
  if (existsSync(join(bundleRoot, ".git"))) return [];

  const finding: Finding = {
    path: ".",
    severity: "warning",
    rule: "not-a-git-repo",
    message: "bundle root is not a git repository",
  };
  return [finding];
}
