import type { Report } from "./reporter";

export function exitCodeForReport(report: Report): 0 | 1 {
  return report.summary.errors > 0 ? 1 : 0;
}
