# Obsidian Vault Connector

Interfaces with an Obsidian vault to read and write notes, follow links, and understand personal knowledge structure.

## Purpose

Access and manage personal notes stored in Obsidian. Enables research mode to explore ideas and save research notes, and writing mode to save drafts—building your knowledge graph over time.

## Tools

### Read Tools

| Tool | Description |
|------|-------------|
| `search_notes` | Search notes by title or content |
| `read_note` | Read full content of a specific note |
| `get_linked_notes` | Get outgoing links and backlinks for a note |
| `get_notes_by_tag` | Find all notes with a specific tag |
| `list_all_tags` | List all tags used in the vault |
| `list_recent_notes` | List recently modified notes |
| `get_folder_structure` | Explore vault organization |

### Write Tools

| Tool | Description |
|------|-------------|
| `create_note` | Create a new note with optional frontmatter |
| `update_note` | Replace content of an existing note |
| `append_to_note` | Append content to an existing note |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OBSIDIAN_VAULT_PATH` | No | `~/documents/mobile vault` | Path to your Obsidian vault |

## Features

- **Wiki-link parsing**: Understands `[[links]]` and `[[links|with aliases]]`
- **Tag extraction**: Finds both inline `#tags` and frontmatter tags
- **Frontmatter parsing**: Extracts YAML frontmatter metadata
- **Backlink discovery**: Finds all notes that link to a given note
- **Auto-create folders**: Creates parent directories when creating notes
- **Frontmatter generation**: Automatically formats YAML frontmatter for new notes

## Folder Structure

The writing agent uses these folders by convention:

```
Your Vault/
├── Research/          # Research session notes (auto-saved)
│   └── 2024-01-03-topic.md
├── Drafts/            # Writing drafts (auto-saved)
│   └── 2024-01-03-article.md
└── ... your other folders
```

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

This MCP enables the writing agent to:
- **Research mode**: Save research sessions to `Research/` folder
- **Writing mode**: Save drafts to `Drafts/` folder
- **Both modes**: Link between research and drafts using `[[wiki-links]]`

All work is persisted and searchable, building your personal knowledge graph over time.
