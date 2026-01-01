# Obsidian Vault Connector

Interfaces with an Obsidian vault to read notes, follow links, and understand personal knowledge structure.

## Purpose

Access personal notes and linked ideas stored in Obsidian. Enables research mode to tap into your personal knowledge graph and follow connections between ideas.

## Tools

| Tool | Description |
|------|-------------|
| `search_notes` | Search notes by title or content |
| `read_note` | Read full content of a specific note |
| `get_linked_notes` | Get outgoing links and backlinks for a note |
| `get_notes_by_tag` | Find all notes with a specific tag |
| `list_all_tags` | List all tags used in the vault |
| `list_recent_notes` | List recently modified notes |
| `get_folder_structure` | Explore vault organization |

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OBSIDIAN_VAULT_PATH` | No | `~/documents/mobile vault` | Path to your Obsidian vault |

## Features

- **Wiki-link parsing**: Understands `[[links]]` and `[[links|with aliases]]`
- **Tag extraction**: Finds both inline `#tags` and frontmatter tags
- **Frontmatter parsing**: Extracts YAML frontmatter metadata
- **Backlink discovery**: Finds all notes that link to a given note

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

This MCP enables the writing agent to access your personal knowledge base in Obsidian. It works seamlessly with research mode to explore ideas and find connections in your notes.
