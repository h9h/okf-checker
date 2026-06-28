import type { Finding } from "../rules/types";

export interface Report {
  findings: Finding[];
  summary: { errors: number; warnings: number };
}

export function buildReport(findings: Finding[]): Report {
  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warning").length;
  return { findings, summary: { errors, warnings } };
}

export function formatText(report: Report): string {
  if (report.findings.length === 0) {
    return "No findings. Bundle is conformant.";
  }

  const byPath = new Map<string, Finding[]>();
  for (const finding of report.findings) {
    const list = byPath.get(finding.path) ?? [];
    list.push(finding);
    byPath.set(finding.path, list);
  }

  const lines: string[] = [];
  for (const [path, pathFindings] of byPath) {
    lines.push(path);
    for (const finding of pathFindings) {
      lines.push(`  ${finding.severity.toUpperCase().padEnd(8)} ${finding.message}`);
    }
    lines.push("");
  }

  lines.push(
    `Summary: ${report.summary.errors} error(s), ${report.summary.warnings} warning(s) across ${byPath.size} file(s)`
  );
  return lines.join("\n");
}

export function formatJson(report: Report): string {
  return JSON.stringify(report, null, 2);
}
