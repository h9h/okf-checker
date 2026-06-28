import type { Finding } from "../types";

export function noTypesGiven(): Finding[] {
  const finding: Finding = {
    path: ".",
    severity: "warning",
    rule: "no-types-given",
    message: "no permissible types list given (use --types or add a types.md to the bundle root); unknown-type checking is skipped",
  };
  return [finding];
}
