# Notion Workspace Connector

Connects to Notion pages and databases containing writing projects, ideas, and structured notes.

## Purpose

Access and manage Notion workspace for project documentation, structured notes, and saving writing drafts. Enables both reading research material and writing back completed drafts.

## Tools

| Tool | Description |
|------|-------------|
| `search_pages` | Search for pages by title or content |
| `read_page` | Read full content of a Notion page |
| `get_page_properties` | Get metadata/properties of a page |
| `query_database` | Query a database with filters and sorts |
| `get_database_schema` | Get the schema of a database |
| `append_to_page` | Append content to an existing page |
| `create_page` | Create a new page in a database or as child |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NOTION_API_TOKEN` | Yes | Your Notion integration token |

## Getting Your Notion Token

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create a new integration
3. Copy the "Internal Integration Token"
4. Share your workspace pages/databases with the integration

## Features

- **Markdown conversion**: Converts Notion blocks to readable markdown
- **URL/ID parsing**: Accepts both Notion URLs and raw page IDs
- **Database queries**: Full support for Notion's filter and sort syntax
- **Content creation**: Write back drafts as new pages

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

This MCP connects the writing agent to your Notion workspace. Use it to:
- Find research notes and project documentation
- Save completed drafts to specific pages or databases
- Query structured databases of ideas or projects
