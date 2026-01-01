import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Notion Workspace Connector
// Connects to Notion pages and databases containing writing projects, ideas, and structured notes

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const NOTION_TOKEN = process.env.NOTION_API_TOKEN || '';

interface NotionPage {
  id: string;
  title: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  parent_type: string;
  parent_id?: string;
}

interface NotionBlock {
  id: string;
  type: string;
  content: string;
  has_children: boolean;
}

interface NotionDatabase {
  id: string;
  title: string;
  description: string;
  properties: Record<string, { type: string; name: string }>;
}

async function notionRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!NOTION_TOKEN) {
    throw new Error('NOTION_API_TOKEN environment variable not set. Get your token from https://www.notion.so/my-integrations');
  }

  const url = `${NOTION_API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Notion API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<T>;
}

function extractPlainText(richText: Array<{ plain_text: string }>): string {
  return richText?.map(t => t.plain_text).join('') || '';
}

function extractPageTitle(page: Record<string, unknown>): string {
  const properties = page.properties as Record<string, unknown>;

  // Try common title property names
  for (const prop of Object.values(properties)) {
    const propObj = prop as Record<string, unknown>;
    if (propObj.type === 'title') {
      return extractPlainText(propObj.title as Array<{ plain_text: string }>);
    }
  }

  return 'Untitled';
}

function blockToText(block: Record<string, unknown>): string {
  const type = block.type as string;
  const content = block[type] as Record<string, unknown>;

  if (!content) return '';

  const richText = content.rich_text as Array<{ plain_text: string }>;
  const text = extractPlainText(richText);

  switch (type) {
    case 'paragraph':
      return text;
    case 'heading_1':
      return `# ${text}`;
    case 'heading_2':
      return `## ${text}`;
    case 'heading_3':
      return `### ${text}`;
    case 'bulleted_list_item':
      return `• ${text}`;
    case 'numbered_list_item':
      return `1. ${text}`;
    case 'to_do':
      const checked = (content.checked as boolean) ? '☑' : '☐';
      return `${checked} ${text}`;
    case 'toggle':
      return `▸ ${text}`;
    case 'code':
      const language = content.language as string || '';
      return `\`\`\`${language}\n${text}\n\`\`\``;
    case 'quote':
      return `> ${text}`;
    case 'callout':
      const emoji = (content.icon as Record<string, string>)?.emoji || '💡';
      return `${emoji} ${text}`;
    case 'divider':
      return '---';
    default:
      return text;
  }
}

const server = new Server(
  { name: 'notion-workspace-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_pages',
        description: 'Search for pages in your Notion workspace by title or content.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query to find pages',
            },
            filter: {
              type: 'string',
              enum: ['page', 'database'],
              description: 'Filter by object type (default: all)',
            },
            limit: {
              type: 'number',
              description: 'Maximum results to return (default: 10)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'read_page',
        description: 'Read the full content of a Notion page by its ID or URL.',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'The page ID or Notion URL',
            },
          },
          required: ['page_id'],
        },
      },
      {
        name: 'get_page_properties',
        description: 'Get the properties/metadata of a Notion page (useful for database items).',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'The page ID to get properties for',
            },
          },
          required: ['page_id'],
        },
      },
      {
        name: 'query_database',
        description: 'Query a Notion database with optional filters and sorts.',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'The database ID to query',
            },
            filter: {
              type: 'object',
              description: 'Notion filter object (see Notion API docs)',
            },
            sorts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  property: { type: 'string' },
                  direction: { type: 'string', enum: ['ascending', 'descending'] },
                },
              },
              description: 'Sort criteria',
            },
            limit: {
              type: 'number',
              description: 'Maximum results (default: 20)',
              default: 20,
            },
          },
          required: ['database_id'],
        },
      },
      {
        name: 'get_database_schema',
        description: 'Get the schema/properties of a Notion database.',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'The database ID',
            },
          },
          required: ['database_id'],
        },
      },
      {
        name: 'append_to_page',
        description: 'Append content blocks to the end of a Notion page.',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'The page ID to append to',
            },
            content: {
              type: 'string',
              description: 'Markdown-style content to append (paragraphs, headings, lists)',
            },
          },
          required: ['page_id', 'content'],
        },
      },
      {
        name: 'create_page',
        description: 'Create a new page in a Notion database or as a child of another page.',
        inputSchema: {
          type: 'object',
          properties: {
            parent_id: {
              type: 'string',
              description: 'Parent page ID or database ID',
            },
            parent_type: {
              type: 'string',
              enum: ['page', 'database'],
              description: 'Whether parent is a page or database',
            },
            title: {
              type: 'string',
              description: 'Title of the new page',
            },
            content: {
              type: 'string',
              description: 'Initial content (markdown-style)',
            },
            properties: {
              type: 'object',
              description: 'Additional properties for database pages',
            },
          },
          required: ['parent_id', 'parent_type', 'title'],
        },
      },
    ],
  };
});

function parseNotionId(input: string): string {
  // Handle Notion URLs
  const urlMatch = input.match(/notion\.so\/(?:[^/]+\/)?([a-f0-9]{32})/i);
  if (urlMatch) {
    return urlMatch[1];
  }

  // Handle UUID format with dashes
  const uuidMatch = input.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
  if (uuidMatch) {
    return uuidMatch[1].replace(/-/g, '');
  }

  // Assume raw ID
  return input.replace(/-/g, '');
}

function markdownToBlocks(content: string): Array<Record<string, unknown>> {
  const lines = content.split('\n');
  const blocks: Array<Record<string, unknown>> = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    let block: Record<string, unknown>;

    if (line.startsWith('# ')) {
      block = {
        type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] },
      };
    } else if (line.startsWith('## ')) {
      block = {
        type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] },
      };
    } else if (line.startsWith('### ')) {
      block = {
        type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] },
      };
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      block = {
        type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] },
      };
    } else if (/^\d+\.\s/.test(line)) {
      block = {
        type: 'numbered_list_item',
        numbered_list_item: { rich_text: [{ type: 'text', text: { content: line.replace(/^\d+\.\s/, '') } }] },
      };
    } else if (line.startsWith('> ')) {
      block = {
        type: 'quote',
        quote: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] },
      };
    } else if (line.startsWith('---')) {
      block = { type: 'divider', divider: {} };
    } else {
      block = {
        type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] },
      };
    }

    blocks.push(block);
  }

  return blocks;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_pages': {
      const { query, filter, limit = 10 } = args as {
        query: string;
        filter?: 'page' | 'database';
        limit?: number;
      };

      const body: Record<string, unknown> = { query, page_size: limit };
      if (filter) {
        body.filter = { value: filter, property: 'object' };
      }

      const response = await notionRequest<{
        results: Array<Record<string, unknown>>;
      }>('/search', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (response.results.length === 0) {
        return { content: [{ type: 'text', text: `No results found for "${query}"` }] };
      }

      const formatted = response.results.map((item, i) => {
        const type = item.object as string;
        const id = item.id as string;
        const url = item.url as string;
        const title = type === 'page'
          ? extractPageTitle(item)
          : extractPlainText((item.title as Array<{ plain_text: string }>) || []);
        const lastEdited = item.last_edited_time as string;

        return `${i + 1}. **${title}** (${type})\n   ID: ${id}\n   URL: ${url}\n   Last edited: ${lastEdited}`;
      }).join('\n\n');

      return { content: [{ type: 'text', text: `Found ${response.results.length} results:\n\n${formatted}` }] };
    }

    case 'read_page': {
      const { page_id } = args as { page_id: string };
      const id = parseNotionId(page_id);

      // Get page metadata
      const page = await notionRequest<Record<string, unknown>>(`/pages/${id}`);
      const title = extractPageTitle(page);
      const url = page.url as string;

      // Get page content (blocks)
      const blocksResponse = await notionRequest<{
        results: Array<Record<string, unknown>>;
      }>(`/blocks/${id}/children?page_size=100`);

      const content = blocksResponse.results
        .map(block => blockToText(block))
        .filter(Boolean)
        .join('\n\n');

      const formatted =
        `# ${title}\n\n` +
        `**URL:** ${url}\n` +
        `**Last edited:** ${page.last_edited_time}\n\n` +
        `---\n\n${content || '(Empty page)'}`;

      return { content: [{ type: 'text', text: formatted }] };
    }

    case 'get_page_properties': {
      const { page_id } = args as { page_id: string };
      const id = parseNotionId(page_id);

      const page = await notionRequest<Record<string, unknown>>(`/pages/${id}`);
      const properties = page.properties as Record<string, Record<string, unknown>>;

      const formatted = Object.entries(properties).map(([name, prop]) => {
        const type = prop.type as string;
        let value: string;

        switch (type) {
          case 'title':
            value = extractPlainText(prop.title as Array<{ plain_text: string }>);
            break;
          case 'rich_text':
            value = extractPlainText(prop.rich_text as Array<{ plain_text: string }>);
            break;
          case 'number':
            value = String(prop.number ?? '');
            break;
          case 'select':
            value = (prop.select as Record<string, string>)?.name || '';
            break;
          case 'multi_select':
            value = (prop.multi_select as Array<{ name: string }>)?.map(s => s.name).join(', ') || '';
            break;
          case 'date':
            const date = prop.date as Record<string, string>;
            value = date ? `${date.start}${date.end ? ` - ${date.end}` : ''}` : '';
            break;
          case 'checkbox':
            value = prop.checkbox ? '☑' : '☐';
            break;
          case 'url':
            value = (prop.url as string) || '';
            break;
          case 'email':
            value = (prop.email as string) || '';
            break;
          case 'status':
            value = (prop.status as Record<string, string>)?.name || '';
            break;
          default:
            value = `(${type})`;
        }

        return `**${name}** (${type}): ${value || '(empty)'}`;
      }).join('\n');

      return { content: [{ type: 'text', text: `Page properties:\n\n${formatted}` }] };
    }

    case 'query_database': {
      const { database_id, filter, sorts, limit = 20 } = args as {
        database_id: string;
        filter?: Record<string, unknown>;
        sorts?: Array<{ property: string; direction: string }>;
        limit?: number;
      };

      const id = parseNotionId(database_id);
      const body: Record<string, unknown> = { page_size: limit };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;

      const response = await notionRequest<{
        results: Array<Record<string, unknown>>;
      }>(`/databases/${id}/query`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (response.results.length === 0) {
        return { content: [{ type: 'text', text: 'No items found in database.' }] };
      }

      const formatted = response.results.map((item, i) => {
        const title = extractPageTitle(item);
        const id = item.id as string;
        const lastEdited = item.last_edited_time as string;

        return `${i + 1}. **${title}**\n   ID: ${id}\n   Last edited: ${lastEdited}`;
      }).join('\n\n');

      return { content: [{ type: 'text', text: `Found ${response.results.length} items:\n\n${formatted}` }] };
    }

    case 'get_database_schema': {
      const { database_id } = args as { database_id: string };
      const id = parseNotionId(database_id);

      const database = await notionRequest<Record<string, unknown>>(`/databases/${id}`);
      const title = extractPlainText((database.title as Array<{ plain_text: string }>) || []);
      const properties = database.properties as Record<string, Record<string, unknown>>;

      const propsFormatted = Object.entries(properties).map(([name, prop]) => {
        const type = prop.type as string;
        let extra = '';

        if (type === 'select' || type === 'multi_select') {
          const options = (prop[type] as { options: Array<{ name: string }> })?.options || [];
          extra = options.length > 0 ? ` [${options.map(o => o.name).join(', ')}]` : '';
        } else if (type === 'status') {
          const options = (prop.status as { options: Array<{ name: string }> })?.options || [];
          extra = options.length > 0 ? ` [${options.map(o => o.name).join(', ')}]` : '';
        }

        return `- **${name}**: ${type}${extra}`;
      }).join('\n');

      return { content: [{ type: 'text', text: `Database: ${title}\n\nProperties:\n${propsFormatted}` }] };
    }

    case 'append_to_page': {
      const { page_id, content } = args as { page_id: string; content: string };
      const id = parseNotionId(page_id);
      const blocks = markdownToBlocks(content);

      await notionRequest(`/blocks/${id}/children`, {
        method: 'PATCH',
        body: JSON.stringify({ children: blocks }),
      });

      return { content: [{ type: 'text', text: `Successfully appended ${blocks.length} blocks to page.` }] };
    }

    case 'create_page': {
      const { parent_id, parent_type, title, content, properties = {} } = args as {
        parent_id: string;
        parent_type: 'page' | 'database';
        title: string;
        content?: string;
        properties?: Record<string, unknown>;
      };

      const id = parseNotionId(parent_id);

      const body: Record<string, unknown> = {
        parent: parent_type === 'database'
          ? { database_id: id }
          : { page_id: id },
      };

      if (parent_type === 'database') {
        // For database pages, title goes in properties
        body.properties = {
          ...properties,
          title: { title: [{ type: 'text', text: { content: title } }] },
        };
      } else {
        // For child pages
        body.properties = {
          title: { title: [{ type: 'text', text: { content: title } }] },
        };
      }

      if (content) {
        body.children = markdownToBlocks(content);
      }

      const page = await notionRequest<Record<string, unknown>>('/pages', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      return {
        content: [{
          type: 'text',
          text: `Created page "${title}"\nID: ${page.id}\nURL: ${page.url}`
        }]
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
