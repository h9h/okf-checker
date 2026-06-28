import { parseArgs } from "node:util";
import { runCheck } from "./commands/check";
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

export function main(argv: string[] = process.argv.slice(2)): number {
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
    default:
      console.error(`Unknown command: ${command}\n`);
      console.error(USAGE);
      return 2;
  }
}

if (import.meta.main) {
  process.exit(main());
}
