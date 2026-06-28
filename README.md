# OKF Checker

OKF is Googles Open Knowledge Format. It is intended to capture knowledge in a format, that is easily ingested by humans an ai alike.

see the specification: [Specification OKF](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)

## OKF Checker

This tool ensures the conformity of a given bundle (a directory of knowledge in OKF) to the specification.

Ask for a list of permissible types - can be a comma separated text or a link to a md-file (default: types.md in root)

Check Conformance as stated in 9 in the spec.

Given root of a bundle:
- check for errors:
  - missing type in frontmatter
  - missing body
  - index.md or log.md with frontmatter
- warn:
  - no title given
  - no description given
  - unstructured body
  - relative links (except in index.md)
  - not a git repository
  - improper citation format

Generate index.md files for root and all subdirectories
- commandline parameter whether to overwrite without asking (default)

## Installation

```sh
bun install
```

## Usage

### Check a bundle for conformance

```sh
bun run src/cli.ts check <bundle-dir> [--types <comma-list-or-path>] [--json]
```

- `--types` — a comma-separated list of permissible types, or a local path to a markdown file listing them as headings (default: `<bundle-dir>/types.md` if present).
- `--json` — emit a machine-readable JSON report instead of human-readable text.

Exit codes:

| Code | Meaning |
|------|---------|
| 0    | No conformance errors (warnings may still be present) |
| 1    | At least one conformance error found |
| 2    | Tool/usage failure (bad arguments, missing bundle directory, unreadable types file) |

### Generate index.md files

```sh
bun run src/cli.ts generate-index <bundle-dir> [--no-overwrite]
```

Writes an `index.md` for the bundle root and every subdirectory. By default existing files are overwritten. With `--no-overwrite`, existing files are left untouched (an interactive prompt asks per file when run in a terminal; in non-interactive contexts such as CI, conflicting files are skipped and reported, and the command still exits `0`).

## Building a standalone binary

```sh
bun run build
```

Compiles `src/cli.ts` into a single native executable at `dist/okf-checker` that runs without Bun installed:

```sh
./dist/okf-checker check <bundle-dir>
```

## Development

```sh
bun test        # run the test suite
bun run typecheck  # type-check with tsc --noEmit
```

