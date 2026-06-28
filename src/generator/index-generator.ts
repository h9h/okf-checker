export interface IndexEntry {
  title: string;
  url: string;
  description?: string;
}

export interface GenerateIndexOptions {
  subdirectories: IndexEntry[];
  concepts: IndexEntry[];
  existingFrontmatter?: string;
}

function formatEntry(entry: IndexEntry): string {
  const description = entry.description ? ` - ${entry.description}` : "";
  return `* [${entry.title}](${entry.url})${description}`;
}

function formatSection(heading: string, entries: IndexEntry[]): string | undefined {
  if (entries.length === 0) return undefined;
  const sorted = [...entries].sort((a, b) => a.title.localeCompare(b.title));
  return `# ${heading}\n\n${sorted.map(formatEntry).join("\n")}`;
}

export function generateIndexMarkdown(options: GenerateIndexOptions): string {
  const sections = [
    formatSection("Subdirectories", options.subdirectories),
    formatSection("Concepts", options.concepts),
  ].filter((section): section is string => section !== undefined);

  const body = sections.length > 0 ? `${sections.join("\n\n")}\n` : "";

  if (options.existingFrontmatter !== undefined) {
    return `---\n${options.existingFrontmatter}\n---\n\n${body}`;
  }
  return body;
}
