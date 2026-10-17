# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`GLOSSARY.md`** at the repo root.
- **ADRs** in `docs/arc42/09-architekturentscheidungen/`: read the ADRs that touch the area you're about to work in. `index.adoc` there lists them all.

## File structure

This is a single-context repo. The ADRs are part of the arc42 documentation, written in German as AsciiDoc:

```
/
├── GLOSSARY.md
├── docs/arc42/09-architekturentscheidungen/
│   ├── index.adoc
│   ├── adr-0001-json-datenbestand.adoc
│   └── adr-0007-bun-statt-deno.adoc
└── src/
```

A new ADR goes into the same folder as `adr-NNNN-<slug>.adoc`, with the next free number, and gets a table row and an `include::` line in `index.adoc`.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `GLOSSARY.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0004 (geteilte Modelle), but worth reopening because…_
