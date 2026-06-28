import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";

export type FileKind = "concept" | "index" | "log";

export interface BundleFile {
  relativePath: string;
  absolutePath: string;
  kind: FileKind;
  isRoot: boolean;
}

export interface BundleDirectory {
  relativePath: string;
  absolutePath: string;
  subdirectories: string[];
  files: BundleFile[];
}

export interface BundleTree {
  root: string;
  files: BundleFile[];
  directories: BundleDirectory[];
}

function toPosix(path: string): string {
  return path.split(sep).join("/");
}

function classify(filename: string): FileKind {
  if (filename === "index.md") return "index";
  if (filename === "log.md") return "log";
  return "concept";
}

function walkDirectory(bundleRoot: string, absoluteDir: string, directories: BundleDirectory[], files: BundleFile[]): void {
  const relativeDir = toPosix(relative(bundleRoot, absoluteDir));
  const entries = readdirSync(absoluteDir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));

  const subdirectories: string[] = [];
  const dirFiles: BundleFile[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    if (entry.isDirectory()) {
      const childRelative = relativeDir === "" ? entry.name : `${relativeDir}/${entry.name}`;
      subdirectories.push(childRelative);
      walkDirectory(bundleRoot, join(absoluteDir, entry.name), directories, files);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".md")) {
      const relativePath = relativeDir === "" ? entry.name : `${relativeDir}/${entry.name}`;
      const file: BundleFile = {
        relativePath,
        absolutePath: join(absoluteDir, entry.name),
        kind: classify(entry.name),
        isRoot: relativeDir === "",
      };
      dirFiles.push(file);
      files.push(file);
    }
  }

  directories.push({
    relativePath: relativeDir,
    absolutePath: absoluteDir,
    subdirectories,
    files: dirFiles,
  });
}

export function walkBundle(bundleRoot: string): BundleTree {
  const directories: BundleDirectory[] = [];
  const files: BundleFile[] = [];
  walkDirectory(bundleRoot, bundleRoot, directories, files);

  directories.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  return { root: bundleRoot, files, directories };
}
