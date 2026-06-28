import { writeIndexFiles, type WriteIndexFilesOptions, type WriteIndexFilesResult } from "../generator/write-index-files";

export type GenerateIndexOptions = WriteIndexFilesOptions;

export async function runGenerateIndex(bundleDir: string, options: GenerateIndexOptions): Promise<WriteIndexFilesResult> {
  return writeIndexFiles(bundleDir, options);
}
