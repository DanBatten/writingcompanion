# Multi-Repo Navigator

Provides intelligent navigation and analysis across multiple code repositories with context awareness.

## Purpose

Enable technical writing about code projects by analyzing repository structure, architecture, and evolution. Supports both local repositories and GitHub projects.

## Tools

| Tool | Description |
|------|-------------|
| `analyze_local_repo` | Analyze structure of a local repository |
| `analyze_github_repo` | Analyze a GitHub repository |
| `read_repo_file` | Read file contents from either source |
| `search_repo` | Search for patterns in repository code |
| `get_recent_commits` | Get commit history |
| `compare_repos` | Compare two repositories |
| `extract_concepts` | Extract key concepts for writing |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No* | GitHub personal access token |

*Required for GitHub API access. Without it, you can still analyze local repositories.

## Getting a GitHub Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate a new token (classic) with `repo` scope
3. Or use a fine-grained token with repository read access

## Features

- **Dual source support**: Analyze both local and GitHub repositories
- **Structure analysis**: Understand directory organization and key files
- **Language detection**: Identify tech stack and primary languages
- **Git integration**: Access commit history and branch information
- **Concept extraction**: Pull out key patterns for writing material

## Development

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

## Integration

This MCP powers the code-project-analyzer skill. Use it to:
- Understand a project's architecture for technical blog posts
- Extract key decisions and patterns for documentation
- Compare different approaches across repositories
