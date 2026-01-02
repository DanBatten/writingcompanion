# idea-forge

A Claude Code agent that serves as an intelligent research partner and writing companion. It integrates your personal knowledge bases with web research to help explore ideas and produce written content.

## What it Does

idea-forge connects to your existing knowledge sources—saved articles, Obsidian notes, Notion workspace, and code repositories—and combines them with web research to support two distinct modes:

- **Research Mode**: Explore ideas, find connections, and build understanding without pressure to produce output
- **Writing Mode**: Transform research into structured written content with outlines, drafts, and revisions

## Features

- **Multi-source research**: Pull from personal knowledge bases and the web simultaneously
- **Semantic search**: Find relevant content by meaning, not just keywords
- **Concept connections**: Discover non-obvious links between ideas across sources
- **Code-to-prose**: Analyze repositories to write about technical projects
- **Source tracking**: Keep track of where insights came from for citation

## Installation

### Prerequisites

- [Claude Code CLI](https://claude.ai/code) installed
- Node.js 18+
- Your API credentials (see Configuration)

### Setup

```bash
# Clone the repository
git clone https://github.com/DanBatten/writingcompanion.git
cd writingcompanion

# Install dependencies for all MCPs
cd mcps/content-capture-mcp && npm install && cd ../..
cd mcps/obsidian-vault-mcp && npm install && cd ../..
cd mcps/notion-workspace-mcp && npm install && cd ../..
cd mcps/multi-repo-mcp && npm install && cd ../..

# Configure environment
cp .env.example .env
# Edit .env with your credentials
```

## Configuration

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTENT_CAPTURE_API_URL` | Yes | Your content-capture API endpoint |
| `CONTENT_CAPTURE_API_KEY` | Yes | API key for content-capture |
| `NOTION_API_TOKEN` | Yes | [Notion integration token](https://www.notion.so/my-integrations) |
| `GITHUB_TOKEN` | No | [GitHub token](https://github.com/settings/tokens) for repo analysis |
| `OBSIDIAN_VAULT_PATH` | No | Path to Obsidian vault (default: `~/documents/mobile vault`) |

## Usage

Start Claude Code from the project directory:

```bash
cd writingcompanion
claude
```

### Skills

#### `/research-mode`

Deep research sessions that explore your knowledge bases and the web.

```
/research-mode                          # Start open-ended research
/research-mode "distributed systems"    # Research a specific topic
```

Research mode will:
- Search your content-capture database, Obsidian notes, and Notion
- Conduct web searches to fill gaps and find current information
- Synthesize findings across all sources
- Track sources for later citation
- Offer to transition to writing mode when ready

#### `/writing-mode`

Structured writing sessions with outlines and progressive drafting.

```
/writing-mode                           # Start a writing session
/writing-mode "blog post about X"       # Write with a specific goal
/writing-mode edit                      # Edit existing content
```

Writing mode will:
- Create outlines before drafting
- Write section by section
- Pull in research findings and sources
- Offer to save drafts to Notion

#### `/concept-web-builder`

Find connections between ideas across your knowledge sources.

```
/concept-web-builder                              # Start with prompts
/concept-web-builder "AI" "organizational design" # Bridge two domains
```

#### `/code-project-analyzer`

Analyze codebases to extract concepts for technical writing.

```
/code-project-analyzer /path/to/local/repo    # Analyze local repo
/code-project-analyzer owner/repo              # Analyze GitHub repo
```

### Example Workflows

**Research to Writing:**
```
You: /research-mode "agentic AI patterns"
     [Claude explores your sources + web, synthesizes findings]

You: Let's turn this into a blog post

You: /writing-mode
     [Claude creates outline from research, drafts sections]
```

**Technical Blog Post:**
```
You: /code-project-analyzer /path/to/my-project
     [Claude analyzes architecture, extracts key patterns]

You: /writing-mode "blog post explaining this architecture"
     [Claude writes using the analysis]
```

**Quick Research:**
```
You: /research-mode
Claude: What would you like to explore?

You: What have I saved about microservices?
     [Searches content-capture and Obsidian]

You: What's the current thinking on this?
     [Web search for recent perspectives]

You: How does this connect to my notes on team structure?
     [Finds connections across sources]
```

## Architecture

```
writingcompanion/
├── .claude/
│   ├── settings.json              # MCP server configuration
│   └── skills/
│       ├── research-mode/         # Research session management
│       ├── writing-mode/          # Writing session management
│       ├── concept-web-builder/   # Concept connection discovery
│       └── code-project-analyzer/ # Code analysis for writing
└── mcps/
    ├── content-capture-mcp/       # Vector search knowledge base
    ├── obsidian-vault-mcp/        # Obsidian notes access
    ├── notion-workspace-mcp/      # Notion read/write
    └── multi-repo-mcp/            # Repository analysis
```

### MCPs

| MCP | Purpose | Key Tools |
|-----|---------|-----------|
| **content-capture** | Semantic search over saved articles/papers | `search_knowledge`, `get_similar_content` |
| **obsidian-vault** | Access Obsidian notes and links | `search_notes`, `get_linked_notes`, `read_note` |
| **notion-workspace** | Read/write Notion pages and databases | `search_pages`, `read_page`, `create_page` |
| **multi-repo** | Analyze local and GitHub repositories | `analyze_local_repo`, `analyze_github_repo`, `extract_concepts` |

## Content Capture API

The content-capture MCP expects an API with these endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/search` | POST | Semantic vector search |
| `/similar/:id` | GET | Find similar content |
| `/content/by-tags` | POST | Filter by tags |
| `/content/:id` | GET | Get single item |
| `/content/recent` | GET | List recent items |

## Development

```bash
# Type-check all MCPs
for dir in mcps/*/; do
  (cd "$dir" && npx tsc --noEmit)
done

# Run an MCP in dev mode
cd mcps/obsidian-vault-mcp
npm run dev

# Build for production
npm run build
```

## License

MIT
