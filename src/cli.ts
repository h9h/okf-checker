import { parseArgs } from "node:util";
import { runCheck } from "./commands/check";
import { runGenerateIndex } from "./commands/generate-index";
import type { WriteIndexFilesResult } from "./generator/write-index-files";
import { exitCodeForReport } from "./report/exit-code";
import { buildReport, formatJson, formatText } from "./report/reporter";
import type { Finding } from "./rules/types";

const USAGE = `Usage:
  okf-checker check <bundle-dir> [--types <list-or-path>] [--json]
  okf-checker generate-index <bundle-dir> [--no-overwrite]

Options:
  -h, --help    Show this help message
`;

function runCheckCommand(args: string[]): number {
  const { values, positionals } = parseArgs({
    args,
    options: {
      types: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(USAGE);
    return 0;
  }

  const bundleDir = positionals[0];
  if (!bundleDir) {
    console.error("Error: <bundle-dir> is required\n");
    console.error(USAGE);
    return 2;
  }

  let findings: Finding[];
  try {
    findings = runCheck(bundleDir, { types: values.types });
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  const report = buildReport(findings);
  console.log(values.json ? formatJson(report) : formatText(report));
  return exitCodeForReport(report);
}

async function runGenerateIndexCommand(args: string[]): Promise<number> {
  const { values, positionals } = parseArgs({
    args,
    options: {
      "no-overwrite": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(USAGE);
    return 0;
  }

  const bundleDir = positionals[0];
  if (!bundleDir) {
    console.error("Error: <bundle-dir> is required\n");
    console.error(USAGE);
    return 2;
  }

  let result: WriteIndexFilesResult;
  try {
    result = await runGenerateIndex(bundleDir, { overwrite: !values["no-overwrite"] });
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }

  console.log(`Wrote ${result.written.length} index.md file(s).`);
  if (result.skipped.length > 0) {
    console.log(`Skipped ${result.skipped.length} existing file(s) (not overwritten):`);
    for (const path of result.skipped) console.log(`  ${path}`);
  }
  return 0;
}

export async function main(argv: string[] = process.argv.slice(2)): Promise<number> {
  const [command, ...rest] = argv;

  if (command === "-h" || command === "--help") {
    console.log(USAGE);
    return 0;
  }

  if (!command) {
    console.error(USAGE);
    return 2;
  }

  switch (command) {
    case "check":
      return runCheckCommand(rest);
    case "generate-index":
      return runGenerateIndexCommand(rest);
    default:
      console.error(`Unknown command: ${command}\n`);
      console.error(USAGE);
      return 2;
  }
}

if (import.meta.main) {
  main().then((code) => process.exit(code));
}
