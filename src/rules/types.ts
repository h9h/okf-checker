import type { BundleFile } from "../core/bundle-walker";
import type { ConceptDoc } from "../core/concept";

export type Severity = "error" | "warning";

export interface Finding {
  path: string;
  severity: Severity;
  rule: string;
  message: string;
}

export interface RuleContext {
  bundleRoot: string;
  file: BundleFile;
  doc: ConceptDoc;
  permissibleTypes?: string[];
}

export type Rule = (ctx: RuleContext) => Finding[];
