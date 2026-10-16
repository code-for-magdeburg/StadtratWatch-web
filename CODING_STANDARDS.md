# Coding Standards

Rules the reviewer applies to a diff. Conventions in `AGENTS.md` (Code Conventions, Boundaries) apply as well.

## Documentation

- **Removals delete their mentions.** When a change removes a file, folder or step, delete every mention of it from the docs. Notes that only explain an absence ("X is not in `data/`", "do not commit X") are findings.

## Scripts

- **CLI help describes the interface.** The usage line in a script's `--help` text names the script and its flags (`bun index.ts -i <input-dir> …`), like the sibling `cli.ts` files. Commands with paths from the repo root belong in the script's README.
