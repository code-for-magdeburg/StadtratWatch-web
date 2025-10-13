---
description: "Creates well-formatted commits with conventional commit messages and emoji"
allowed-tools:
  [
    "Bash(git status:*)",
    "Bash(git commit:*)",
    "Bash(git diff:*)",
    "Bash(git log:*)"
  ]
---

# Claude Command: Commit

Creates well-formatted commits with conventional commit messages and emoji.

## Usage

```
/commit
```

## Process

1. Check staged files, commit only staged files if any exist
2. Analyze diff for multiple logical changes
3. Suggest splitting if needed
4. Create commit with emoji conventional format

## Commit Format

```
<emoji> <type>: <message title>

<bullet points summarizing what was updated>
```

## Example Titles

```
✨ feat(auth): add JWT login flow
🐛 fix(ui): handle null pointer in sidebar
♻️ refactor(api): split user controller logic
📝 docs(readme): add usage section
```

## Example with Title and Body

```
✨ feat(auth): add JWT login flow

- Implemented JWT token validation logic
- Added documentation for the validation component
```

## Allowed Types

| Type        | Description                           |
|-------------| ------------------------------------- |
| ✨ feat     | New feature                           |
| 🐛 fix      | Bug fix                               |
| 🔧 chore    | Maintenance (e.g., tooling, deps)     |
| 📝 docs     | Documentation changes                 |
| ♻️ refactor | Code restructure (no behavior change) |
| ✅ test     | Adding or refactoring tests           |
| 💄 style    | Code formatting (no logic change)     |
| ⚡️ perf     | Performance improvements              |
| 🔒️ sec      | Security fixes                        |
| 👷 ci       | CI/CD related changes                 |


## Split Criteria

Different concerns | Mixed types | File patterns | Large changes

## Rules

- Imperative mood ("add" not "added")
- Atomic commits (single purpose)
- Only commit staged files if any exist
- Analyze diff for splitting suggestions
- title is lowercase, no period at the end
- Title should be a clear summary, max 72 characters
- Use the body (optional) to explain *why*, not just *what*
- Bullet points should be concise and high-level
- Avoid vague titles like: "update", "fix stuff"
- Avoid overly long or unfocused titles
- Avoid excessive detail in bullet points
- **NEVER add Claude signature to commits**
