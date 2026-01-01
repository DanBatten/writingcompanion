# Content Capture Integration

Connects to personal content-capture API to search embedded vectors and retrieve relevant articles, papers, and inspiration.

## Purpose

Access curated knowledge base of interesting content for research and writing. Uses semantic vector search to find relevant content based on meaning rather than just keywords.

## Tools

| Tool | Description |
|------|-------------|
| `search_knowledge` | Semantic search across captured content |
| `get_similar_content` | Find content similar to a specific item |
| `get_content_by_tags` | Browse content by tag categories |
| `get_content_item` | Retrieve full content of a specific item |
| `list_recent_captures` | List recently captured content |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONTENT_CAPTURE_API_URL` | Yes | Base URL for your content-capture API |
| `CONTENT_CAPTURE_API_KEY` | Yes | API key for authentication |

## Expected API Endpoints

The MCP expects your content-capture API to provide:

- `POST /search` - Semantic search with `{ query, limit, min_similarity }`
- `GET /similar/:id` - Find similar content
- `POST /content/by-tags` - Filter by tags
- `GET /content/:id` - Get single item
- `GET /content/recent` - List recent items

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

This MCP is designed to work with the idea-forge writing agent. It provides the foundation for research mode by accessing your personal knowledge base of saved articles, papers, and notes.
