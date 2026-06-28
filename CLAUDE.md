# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository currently contains only a README describing the intended tool — no source code, package manifest, or test suite exists yet. There are no build/lint/test commands to run until the implementation is started. 

Use bun / typescript.

## What this tool is

OKF Checker validates a "bundle" (a directory of knowledge files) against Google's Open Knowledge Format (OKF) — see the [OKF specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md).

## Intended behavior (from README, not yet implemented)

This checker is intentionally **stricter than OKF's own conformance model**: the spec (§9) says consumers MUST tolerate unknown/missing optional fields and unknown types, but this tool treats several of those as hard errors. Don't "fix" that by relaxing rules to match the spec — it's deliberate.

- Accepts a list of permissible types, either as comma-separated text or a link to a markdown file (default: `types.md` in the bundle root). `types.md` is **not** a spec-reserved filename, so it is itself treated as a concept document and must be conformant (frontmatter with `type`, non-empty body) like any other `.md` file.
- Checks conformance to section 9 of the OKF spec, plus the stricter project-specific rules below. Given the root of a bundle:
  - **Errors:**
    - missing `type` in frontmatter
    - missing body
    - `type` not present in the permissible-types list (spec says consumers must tolerate unknown types — this tool deliberately does not)
    - `index.md` or `log.md` containing frontmatter — **except** a bundle-root `index.md`, which is allowed to carry frontmatter containing only `okf_version` per spec §11
  - **Warnings:**
    - no title given
    - no description given
    - unstructured body — defined as: body contains no markdown headings at all
    - relative links (except within `index.md`, where the spec's own examples use relative paths)
    - bundle is not a git repository — checked at the bundle root only (a `.git` in an ancestor directory does not count, even though spec §3 permits a bundle to be a subdirectory of a larger repo)
    - improper citation format — covers both: citations not placed under a `# Citations` heading, and citations under that heading not matching the numbered `[n] [text](url)` form (including non-sequential numbering)
- Generates `index.md` files for the bundle root and all subdirectories, with a command-line flag controlling whether to overwrite existing files without asking (default: overwrite). Generated index files use one section per immediate subdirectory plus one section for root-level concepts, each listing entries alphabetically. When regenerating a bundle-root `index.md` that already has an `okf_version` frontmatter line, preserve it rather than stripping it.

When implementing, treat the OKF spec linked above as the source of truth for anything not covered by the rules above.
