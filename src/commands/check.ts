import { walkBundle } from "../core/bundle-walker";
import { parseConceptFile } from "../core/concept";
import { loadTypesList } from "../core/types-list";
import { errorRules, warningRules } from "../rules";
import type { Finding, RuleContext } from "../rules/types";
import { notAGitRepo } from "../rules/warnings/not-a-git-repo";

export interface CheckOptions {
  types?: string;
}

export function runCheck(bundleDir: string, options: CheckOptions = {}): Finding[] {
  const tree = walkBundle(bundleDir);
  const typesResult = loadTypesList(bundleDir, options.types);
  const permissibleTypes = typesResult.kind === "unset" ? undefined : typesResult.types;

  const findings: Finding[] = [];

  for (const file of tree.files) {
    const parsed = parseConceptFile(file.absolutePath);
    if (!parsed.ok) {
      findings.push({
        path: file.relativePath,
        severity: "error",
        rule: "parse-error",
        message: `failed to parse frontmatter: ${parsed.error.message}`,
      });
      continue;
    }

    const ctx: RuleContext = { bundleRoot: bundleDir, file, doc: parsed.doc, permissibleTypes };
    for (const rule of errorRules) findings.push(...rule(ctx));
    for (const rule of warningRules) findings.push(...rule(ctx));
  }

  findings.push(...notAGitRepo(bundleDir));

  findings.sort((a, b) => a.path.localeCompare(b.path) || a.rule.localeCompare(b.rule));
  return findings;
}
