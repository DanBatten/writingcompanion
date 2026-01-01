# idea-forge

A Claude Code terminal agent that serves as an intelligent research partner and writing companion. It integrates access to personal knowledge bases (content-capture API, Obsidian vault, Notion), code repositories, and switches between deep research/thinking mode and structured writing mode to help explore and articulate advanced design and AI technology ideas.

## Architecture

The agent operates through a central orchestrator that manages two distinct modes: Research Mode (for exploring ideas, connecting concepts, and deep analysis) and Writing Mode (for structured content creation). It integrates multiple knowledge sources through custom MCPs and uses specialized skills for different aspects of research and writing workflows.

### Components

- Mode Orchestrator (Research vs Writing)
- Knowledge Source Integrations (Content-Capture API, Obsidian, Notion)
- Code Repository Analysis Engine
- Concept Connection & Research Engine
- Structured Writing Assistant
- Context Management System
- Citation & Reference Manager

## Skills

- **`/research-mode`**: Manages deep research sessions, concept exploration, and idea development without writing pressure. Facilitates connections between disparate concepts and progressive thinking.
- **`/writing-mode`**: Structures writing sessions with clear goals, outlines, and progressive development. Integrates research findings into coherent narratives.
- **`/code-project-analyzer`**: Traverses and understands code repositories to extract key concepts, architectural decisions, and innovations for writing about technical projects.
- **`/concept-web-builder`**: Creates dynamic connections between ideas from different knowledge sources, identifying patterns and relationships for deeper insights.

## MCPs

- **Content Capture Integration**: Connects to personal content-capture API to search embedded vectors and retrieve relevant articles, papers, and inspiration
- **Obsidian Vault Connector**: Interfaces with Obsidian vault to read notes, follow links, and understand personal knowledge structure
- **Notion Workspace Connector**: Connects to Notion pages and databases containing writing projects, ideas, and structured notes
- **Multi-Repo Navigator**: Provides intelligent navigation and analysis across multiple code repositories with context awareness

## Getting Started

### 1. Install Dependencies

Each MCP needs its dependencies installed:

```bash
cd mcps/content-capture-mcp && npm install
cd ../obsidian-vault-mcp && npm install
cd ../notion-workspace-mcp && npm install
cd ../multi-repo-mcp && npm install
```

### 2. Configure Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Content Capture API
export CONTENT_CAPTURE_API_URL="http://your-api-url"
export CONTENT_CAPTURE_API_KEY="your-api-key"

# Obsidian Vault (optional, has default)
export OBSIDIAN_VAULT_PATH="~/documents/mobile vault"

# Notion Integration
export NOTION_API_TOKEN="your-notion-integration-token"

# GitHub Access (optional, for GitHub repo analysis)
export GITHUB_TOKEN="your-github-token"
```

### 3. Configure Claude Code

The `.claude/settings.json` file is already configured with the MCP servers. Claude Code will automatically load them when running in this directory.

### 4. Use the Skills

Once configured, use the skills via slash commands:

```
/research-mode                    # Start a research session
/research-mode "distributed systems"  # Research with a specific topic
/writing-mode                     # Start a writing session
/writing-mode "blog post about X" # Write with a specific goal
/code-project-analyzer /path/to/repo  # Analyze a local repo
/code-project-analyzer owner/repo     # Analyze a GitHub repo
/concept-web-builder              # Build a concept web
```

## Workflow Examples

### Research to Writing Flow

1. Start with `/research-mode "topic"` to explore ideas
2. Use concept-web-builder to find connections
3. When ready, transition to `/writing-mode`
4. Writing mode uses research findings to structure content

### Technical Writing Flow

1. Use `/code-project-analyzer` to understand a codebase
2. Extract key concepts and patterns
3. Switch to `/writing-mode` for the blog post or documentation
4. Pull code examples and architecture details into the writing

## Project Structure

```
.
├── .claude/
│   ├── settings.json           # Claude Code MCP configuration
│   └── skills/
│       ├── research-mode/      # Research session management
│       ├── writing-mode/       # Writing session management
│       ├── concept-web-builder/ # Concept connection discovery
│       └── code-project-analyzer/ # Code analysis for writing
├── mcps/
│   ├── content-capture-mcp/    # Vector search knowledge base
│   ├── obsidian-vault-mcp/     # Obsidian notes access
│   ├── notion-workspace-mcp/   # Notion integration
│   └── multi-repo-mcp/         # Code repository analysis
└── PROJECT.md                  # This file
```

## Development

### Building MCPs

```bash
# Build all MCPs
for dir in mcps/*/; do
  cd "$dir" && npm run build && cd ../..
done
```

### Testing MCPs

```bash
# Run MCP in dev mode
cd mcps/content-capture-mcp
npm run dev
```

### Customizing Skills

Edit the `SKILL.md` files in `.claude/skills/*/` to customize behavior. Skills are written in markdown with frontmatter and follow Claude Code's skill format.
