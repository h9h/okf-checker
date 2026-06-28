import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { join } from "node:path";
import type { BundleDirectory } from "../core/bundle-walker";
import { walkBundle } from "../core/bundle-walker";
import { parseConceptFile, parseConceptSource } from "../core/concept";
import type { IndexEntry } from "./index-generator";
import { generateIndexMarkdown } from "./index-generator";

export interface WriteIndexFilesOptions {
  overwrite: boolean;
  isTTY?: boolean;
  promptOverwrite?: (relativePath: string) => Promise<boolean>;
}

export interface WriteIndexFilesResult {
  written: string[];
  skipped: string[];
}

function titleFromFilename(relativePath: string): string {
  const base = relativePath.split("/").pop() ?? relativePath;
  return base.replace(/\.md$/, "");
}

function buildEntries(directory: BundleDirectory): { subdirectories: IndexEntry[]; concepts: IndexEntry[] } {
  const subdirectories: IndexEntry[] = directory.subdirectories.map((sub) => {
    const name = sub.split("/").pop() ?? sub;
    return { title: name, url: `${name}/` };
  });

  const concepts: IndexEntry[] = directory.files
    .filter((file) => file.kind === "concept")
    .map((file) => {
      const name = file.relativePath.split("/").pop() ?? file.relativePath;
      const parsed = parseConceptFile(file.absolutePath);
      if (!parsed.ok) {
        return { title: titleFromFilename(file.relativePath), url: name };
      }
      const title =
        typeof parsed.doc.frontmatter.title === "string" ? parsed.doc.frontmatter.title : titleFromFilename(file.relativePath);
      const description =
        typeof parsed.doc.frontmatter.description === "string" ? parsed.doc.frontmatter.description : undefined;
      return { title, url: name, description };
    });

  return { subdirectories, concepts };
}

function formatOkfVersion(value: unknown): string {
  return typeof value === "string" ? `okf_version: ${JSON.stringify(value)}` : `okf_version: ${String(value)}`;
}

function readExistingOkfVersion(indexPath: string): string | undefined {
  if (!existsSync(indexPath)) return undefined;
  const parsed = parseConceptSource(indexPath, readFileSync(indexPath, "utf8"));
  if (!parsed.ok) return undefined;
  const version = parsed.doc.frontmatter.okf_version;
  return version === undefined ? undefined : formatOkfVersion(version);
}

async function promptViaReadline(relativePath: string): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`Overwrite ${relativePath}? [y/N] `);
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    rl.close();
  }
}

export async function writeIndexFiles(bundleDir: string, options: WriteIndexFilesOptions): Promise<WriteIndexFilesResult> {
  const tree = walkBundle(bundleDir);
  const written: string[] = [];
  const skipped: string[] = [];

  for (const directory of tree.directories) {
    const indexPath = join(directory.absolutePath, "index.md");
    const relativeIndexPath = directory.relativePath === "" ? "index.md" : `${directory.relativePath}/index.md`;

    if (existsSync(indexPath) && !options.overwrite) {
      const isTTY = options.isTTY ?? Boolean(process.stdout.isTTY);
      const shouldOverwrite = isTTY
        ? await (options.promptOverwrite ?? promptViaReadline)(relativeIndexPath)
        : false;
      if (!shouldOverwrite) {
        skipped.push(relativeIndexPath);
        continue;
      }
    }

    const { subdirectories, concepts } = buildEntries(directory);
    const existingFrontmatter = directory.relativePath === "" ? readExistingOkfVersion(indexPath) : undefined;
    const markdown = generateIndexMarkdown({ subdirectories, concepts, existingFrontmatter });
    writeFileSync(indexPath, markdown);
    written.push(relativeIndexPath);
  }

  return { written, skipped };
}
