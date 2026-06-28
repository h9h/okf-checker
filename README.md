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

