import { missingBody } from "./errors/missing-body";
import { missingType } from "./errors/missing-type";
import { reservedFrontmatter } from "./errors/reserved-frontmatter";
import { unknownType } from "./errors/unknown-type";
import type { Rule } from "./types";
import { citationFormat } from "./warnings/citation-format";
import { missingDescription } from "./warnings/missing-description";
import { missingTitle } from "./warnings/missing-title";
import { relativeLinks } from "./warnings/relative-links";
import { unstructuredBody } from "./warnings/unstructured-body";

export const errorRules: Rule[] = [missingType, missingBody, unknownType, reservedFrontmatter];

export const warningRules: Rule[] = [
  missingTitle,
  missingDescription,
  unstructuredBody,
  relativeLinks,
  citationFormat,
];

export type { Finding, Rule, RuleContext, Severity } from "./types";
