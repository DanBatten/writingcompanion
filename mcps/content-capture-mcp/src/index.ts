import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Content Capture Integration
// Connects to personal content-capture API to search embedded vectors and retrieve relevant articles, papers, and inspiration

interface SearchResult {
  id: string;
  title: string;
  content: string;
  url?: string;
  source?: string;
  tags?: string[];
  similarity: number;
  captured_at: string;
}

interface ContentItem {
  id: string;
  title: string;
  content: string;
  url?: string;
  source?: string;
  tags?: string[];
  captured_at: string;
  metadata?: Record<string, unknown>;
}

const API_BASE_URL = process.env.CONTENT_CAPTURE_API_URL || 'http://localhost:3000';
const API_KEY = process.env.CONTENT_CAPTURE_API_KEY || '';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

const server = new Server(
  { name: 'content-capture-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_knowledge',
        description: 'Search your captured content using semantic vector search. Returns the most relevant articles, papers, and notes based on meaning similarity.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query - can be a question, topic, or concept to find related content',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10)',
              default: 10,
            },
            min_similarity: {
              type: 'number',
              description: 'Minimum similarity score threshold 0-1 (default: 0.5)',
              default: 0.5,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_similar_content',
        description: 'Find content similar to a specific captured item. Useful for exploring related ideas and concepts.',
        inputSchema: {
          type: 'object',
          properties: {
            content_id: {
              type: 'string',
              description: 'The ID of the content item to find similar items for',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of similar items to return (default: 5)',
              default: 5,
            },
          },
          required: ['content_id'],
        },
      },
      {
        name: 'get_content_by_tags',
        description: 'Retrieve all captured content matching specific tags. Useful for browsing by category or theme.',
        inputSchema: {
          type: 'object',
          properties: {
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of tags to filter by (items must match ALL tags)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return (default: 20)',
              default: 20,
            },
          },
          required: ['tags'],
        },
      },
      {
        name: 'get_content_item',
        description: 'Retrieve the full content of a specific captured item by its ID.',
        inputSchema: {
          type: 'object',
          properties: {
            content_id: {
              type: 'string',
              description: 'The ID of the content item to retrieve',
            },
          },
          required: ['content_id'],
        },
      },
      {
        name: 'list_recent_captures',
        description: 'List recently captured content, sorted by capture date.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of items to return (default: 10)',
              default: 10,
            },
            offset: {
              type: 'number',
              description: 'Number of items to skip for pagination (default: 0)',
              default: 0,
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_knowledge': {
      const { query, limit = 10, min_similarity = 0.5 } = args as {
        query: string;
        limit?: number;
        min_similarity?: number;
      };

      const results = await apiRequest<SearchResult[]>('/search', {
        method: 'POST',
        body: JSON.stringify({ query, limit, min_similarity }),
      });

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: 'No matching content found for your query.' }],
        };
      }

      const formatted = results.map((r, i) =>
        `${i + 1}. **${r.title}** (similarity: ${(r.similarity * 100).toFixed(1)}%)\n` +
        `   ID: ${r.id}\n` +
        (r.source ? `   Source: ${r.source}\n` : '') +
        (r.url ? `   URL: ${r.url}\n` : '') +
        (r.tags?.length ? `   Tags: ${r.tags.join(', ')}\n` : '') +
        `   Preview: ${r.content.substring(0, 200)}...`
      ).join('\n\n');

      return {
        content: [{ type: 'text', text: `Found ${results.length} matching items:\n\n${formatted}` }],
      };
    }

    case 'get_similar_content': {
      const { content_id, limit = 5 } = args as {
        content_id: string;
        limit?: number;
      };

      const results = await apiRequest<SearchResult[]>(`/similar/${content_id}?limit=${limit}`);

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: 'No similar content found.' }],
        };
      }

      const formatted = results.map((r, i) =>
        `${i + 1}. **${r.title}** (similarity: ${(r.similarity * 100).toFixed(1)}%)\n` +
        `   ID: ${r.id}\n` +
        `   Preview: ${r.content.substring(0, 200)}...`
      ).join('\n\n');

      return {
        content: [{ type: 'text', text: `Found ${results.length} similar items:\n\n${formatted}` }],
      };
    }

    case 'get_content_by_tags': {
      const { tags, limit = 20 } = args as {
        tags: string[];
        limit?: number;
      };

      const results = await apiRequest<ContentItem[]>('/content/by-tags', {
        method: 'POST',
        body: JSON.stringify({ tags, limit }),
      });

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No content found with tags: ${tags.join(', ')}` }],
        };
      }

      const formatted = results.map((r, i) =>
        `${i + 1}. **${r.title}**\n` +
        `   ID: ${r.id}\n` +
        `   Tags: ${r.tags?.join(', ') || 'none'}\n` +
        `   Captured: ${r.captured_at}`
      ).join('\n\n');

      return {
        content: [{ type: 'text', text: `Found ${results.length} items with tags [${tags.join(', ')}]:\n\n${formatted}` }],
      };
    }

    case 'get_content_item': {
      const { content_id } = args as { content_id: string };

      const item = await apiRequest<ContentItem>(`/content/${content_id}`);

      const formatted =
        `# ${item.title}\n\n` +
        (item.source ? `**Source:** ${item.source}\n` : '') +
        (item.url ? `**URL:** ${item.url}\n` : '') +
        (item.tags?.length ? `**Tags:** ${item.tags.join(', ')}\n` : '') +
        `**Captured:** ${item.captured_at}\n\n` +
        `---\n\n${item.content}`;

      return {
        content: [{ type: 'text', text: formatted }],
      };
    }

    case 'list_recent_captures': {
      const { limit = 10, offset = 0 } = args as {
        limit?: number;
        offset?: number;
      };

      const results = await apiRequest<ContentItem[]>(`/content/recent?limit=${limit}&offset=${offset}`);

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: 'No recent captures found.' }],
        };
      }

      const formatted = results.map((r, i) =>
        `${offset + i + 1}. **${r.title}**\n` +
        `   ID: ${r.id}\n` +
        (r.source ? `   Source: ${r.source}\n` : '') +
        `   Captured: ${r.captured_at}`
      ).join('\n\n');

      return {
        content: [{ type: 'text', text: `Recent captures:\n\n${formatted}` }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
