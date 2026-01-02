import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { homedir } from 'os';

// Obsidian Vault Connector
// Interfaces with Obsidian vault to read notes, follow links, and understand personal knowledge structure

const VAULT_PATH = process.env.OBSIDIAN_VAULT_PATH || path.join(homedir(), 'documents', 'mobile vault');

interface NoteMetadata {
  path: string;
  name: string;
  modified: Date;
  created: Date;
  size: number;
  tags: string[];
  links: string[];
  backlinks: string[];
}

interface NoteContent {
  path: string;
  name: string;
  content: string;
  frontmatter: Record<string, unknown>;
  tags: string[];
  links: string[];
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getAllMarkdownFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      // Skip hidden directories and files
      if (entry.name.startsWith('.')) continue;

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

function extractTags(content: string): string[] {
  const tagRegex = /#([a-zA-Z][a-zA-Z0-9_/-]*)/g;
  const tags: Set<string> = new Set();
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }

  return Array.from(tags);
}

function extractLinks(content: string): string[] {
  const linkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  const links: Set<string> = new Set();
  let match;

  while ((match = linkRegex.exec(content)) !== null) {
    links.add(match[1]);
  }

  return Array.from(links);
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: {}, body: content };
  }

  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter: Record<string, unknown> = {};

  // Simple YAML parsing for common cases
  const lines = frontmatterStr.split('\n');
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value: unknown = line.substring(colonIndex + 1).trim();

      // Handle arrays
      if (value === '') {
        continue;
      } else if ((value as string).startsWith('[') && (value as string).endsWith(']')) {
        value = (value as string).slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
      } else if ((value as string).startsWith('"') || (value as string).startsWith("'")) {
        value = (value as string).slice(1, -1);
      }

      frontmatter[key] = value;
    }
  }

  return { frontmatter, body };
}

async function readNote(notePath: string): Promise<NoteContent | null> {
  const fullPath = notePath.startsWith(VAULT_PATH)
    ? notePath
    : path.join(VAULT_PATH, notePath.endsWith('.md') ? notePath : `${notePath}.md`);

  if (!await fileExists(fullPath)) {
    return null;
  }

  const content = await fs.readFile(fullPath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  // Combine frontmatter tags with inline tags
  const inlineTags = extractTags(body);
  const frontmatterTags = Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : [];
  const allTags = [...new Set([...frontmatterTags, ...inlineTags])];

  return {
    path: path.relative(VAULT_PATH, fullPath),
    name: path.basename(fullPath, '.md'),
    content: body,
    frontmatter,
    tags: allTags,
    links: extractLinks(body),
  };
}

async function findBacklinks(targetNote: string): Promise<string[]> {
  const allFiles = await getAllMarkdownFiles(VAULT_PATH);
  const backlinks: string[] = [];
  const targetName = path.basename(targetNote, '.md');

  for (const file of allFiles) {
    const content = await fs.readFile(file, 'utf-8');
    const links = extractLinks(content);

    if (links.some(link => link === targetName || link.endsWith(`/${targetName}`))) {
      backlinks.push(path.relative(VAULT_PATH, file));
    }
  }

  return backlinks;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

function formatFrontmatter(metadata: Record<string, unknown>): string {
  if (Object.keys(metadata).length === 0) return '';

  const lines = ['---'];
  for (const [key, value] of Object.entries(metadata)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map(v => `"${v}"`).join(', ')}]`);
    } else if (typeof value === 'string') {
      lines.push(`${key}: "${value}"`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

const server = new Server(
  { name: 'obsidian-vault-mcp', version: '0.2.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_notes',
        description: 'Search for notes in the Obsidian vault by text content or title. Returns matching notes with context.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query - matches against note titles and content',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 10)',
              default: 10,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'read_note',
        description: 'Read the full content of a specific note by its path or name.',
        inputSchema: {
          type: 'object',
          properties: {
            note_path: {
              type: 'string',
              description: 'Path to the note (relative to vault root) or note name',
            },
          },
          required: ['note_path'],
        },
      },
      {
        name: 'get_linked_notes',
        description: 'Get all notes that are linked from a specific note (outgoing links) and notes that link to it (backlinks).',
        inputSchema: {
          type: 'object',
          properties: {
            note_path: {
              type: 'string',
              description: 'Path to the note to find links for',
            },
          },
          required: ['note_path'],
        },
      },
      {
        name: 'get_notes_by_tag',
        description: 'Find all notes with a specific tag.',
        inputSchema: {
          type: 'object',
          properties: {
            tag: {
              type: 'string',
              description: 'Tag to search for (without the # symbol)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results (default: 20)',
              default: 20,
            },
          },
          required: ['tag'],
        },
      },
      {
        name: 'list_all_tags',
        description: 'List all tags used in the vault with their frequency.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_recent_notes',
        description: 'List recently modified notes in the vault.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of notes to return (default: 10)',
              default: 10,
            },
          },
        },
      },
      {
        name: 'get_folder_structure',
        description: 'Get the folder structure of the vault to understand organization.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Folder path to list (relative to vault root, default: root)',
              default: '',
            },
            depth: {
              type: 'number',
              description: 'How deep to recurse into subfolders (default: 2)',
              default: 2,
            },
          },
        },
      },
      {
        name: 'create_note',
        description: 'Create a new note in the Obsidian vault. Creates parent folders if needed.',
        inputSchema: {
          type: 'object',
          properties: {
            note_path: {
              type: 'string',
              description: 'Path for the new note (relative to vault root, e.g., "Research/my-topic.md")',
            },
            content: {
              type: 'string',
              description: 'Content of the note (markdown)',
            },
            frontmatter: {
              type: 'object',
              description: 'Optional frontmatter metadata (e.g., { tags: ["research"], date: "2024-01-03" })',
            },
            overwrite: {
              type: 'boolean',
              description: 'If true, overwrite existing note. If false (default), fail if note exists.',
              default: false,
            },
          },
          required: ['note_path', 'content'],
        },
      },
      {
        name: 'update_note',
        description: 'Update/replace the content of an existing note. Preserves or updates frontmatter.',
        inputSchema: {
          type: 'object',
          properties: {
            note_path: {
              type: 'string',
              description: 'Path to the note to update',
            },
            content: {
              type: 'string',
              description: 'New content for the note (replaces existing content)',
            },
            frontmatter: {
              type: 'object',
              description: 'Optional new frontmatter (merged with existing if not provided)',
            },
          },
          required: ['note_path', 'content'],
        },
      },
      {
        name: 'append_to_note',
        description: 'Append content to the end of an existing note.',
        inputSchema: {
          type: 'object',
          properties: {
            note_path: {
              type: 'string',
              description: 'Path to the note to append to',
            },
            content: {
              type: 'string',
              description: 'Content to append',
            },
            create_if_missing: {
              type: 'boolean',
              description: 'If true, create the note if it does not exist',
              default: false,
            },
          },
          required: ['note_path', 'content'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'search_notes': {
      const { query, limit = 10 } = args as { query: string; limit?: number };
      const allFiles = await getAllMarkdownFiles(VAULT_PATH);
      const results: Array<{ path: string; name: string; matches: string[] }> = [];
      const queryLower = query.toLowerCase();

      for (const file of allFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const fileName = path.basename(file, '.md');
        const relativePath = path.relative(VAULT_PATH, file);

        const nameMatch = fileName.toLowerCase().includes(queryLower);
        const contentMatches: string[] = [];

        // Find matching lines
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].toLowerCase().includes(queryLower)) {
            const context = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 2)).join('\n');
            contentMatches.push(`Line ${i + 1}: ${context}`);
            if (contentMatches.length >= 3) break;
          }
        }

        if (nameMatch || contentMatches.length > 0) {
          results.push({
            path: relativePath,
            name: fileName,
            matches: nameMatch ? [`Title match: "${fileName}"`].concat(contentMatches) : contentMatches,
          });
        }

        if (results.length >= limit) break;
      }

      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No notes found matching "${query}"` }] };
      }

      const formatted = results.map((r, i) =>
        `${i + 1}. **${r.name}**\n   Path: ${r.path}\n   ${r.matches.join('\n   ')}`
      ).join('\n\n');

      return { content: [{ type: 'text', text: `Found ${results.length} notes:\n\n${formatted}` }] };
    }

    case 'read_note': {
      const { note_path } = args as { note_path: string };
      const note = await readNote(note_path);

      if (!note) {
        return { content: [{ type: 'text', text: `Note not found: ${note_path}` }] };
      }

      const formatted =
        `# ${note.name}\n\n` +
        `**Path:** ${note.path}\n` +
        (note.tags.length ? `**Tags:** ${note.tags.map(t => `#${t}`).join(' ')}\n` : '') +
        (note.links.length ? `**Links to:** ${note.links.join(', ')}\n` : '') +
        (Object.keys(note.frontmatter).length ? `**Frontmatter:** ${JSON.stringify(note.frontmatter)}\n` : '') +
        `\n---\n\n${note.content}`;

      return { content: [{ type: 'text', text: formatted }] };
    }

    case 'get_linked_notes': {
      const { note_path } = args as { note_path: string };
      const note = await readNote(note_path);

      if (!note) {
        return { content: [{ type: 'text', text: `Note not found: ${note_path}` }] };
      }

      const backlinks = await findBacklinks(note_path);

      let formatted = `# Links for: ${note.name}\n\n`;

      if (note.links.length > 0) {
        formatted += `## Outgoing Links (${note.links.length})\n`;
        formatted += note.links.map(l => `- [[${l}]]`).join('\n');
        formatted += '\n\n';
      } else {
        formatted += '## Outgoing Links\nNo outgoing links.\n\n';
      }

      if (backlinks.length > 0) {
        formatted += `## Backlinks (${backlinks.length})\n`;
        formatted += backlinks.map(l => `- ${l}`).join('\n');
      } else {
        formatted += '## Backlinks\nNo notes link to this note.';
      }

      return { content: [{ type: 'text', text: formatted }] };
    }

    case 'get_notes_by_tag': {
      const { tag, limit = 20 } = args as { tag: string; limit?: number };
      const allFiles = await getAllMarkdownFiles(VAULT_PATH);
      const results: Array<{ path: string; name: string }> = [];
      const tagLower = tag.toLowerCase().replace(/^#/, '');

      for (const file of allFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const tags = extractTags(content).map(t => t.toLowerCase());
        const { frontmatter } = parseFrontmatter(content);
        const fmTags = Array.isArray(frontmatter.tags)
          ? (frontmatter.tags as string[]).map(t => t.toLowerCase())
          : [];

        if (tags.includes(tagLower) || fmTags.includes(tagLower)) {
          results.push({
            path: path.relative(VAULT_PATH, file),
            name: path.basename(file, '.md'),
          });
        }

        if (results.length >= limit) break;
      }

      if (results.length === 0) {
        return { content: [{ type: 'text', text: `No notes found with tag #${tag}` }] };
      }

      const formatted = results.map((r, i) =>
        `${i + 1}. **${r.name}** - ${r.path}`
      ).join('\n');

      return { content: [{ type: 'text', text: `Notes with #${tag} (${results.length}):\n\n${formatted}` }] };
    }

    case 'list_all_tags': {
      const allFiles = await getAllMarkdownFiles(VAULT_PATH);
      const tagCounts: Map<string, number> = new Map();

      for (const file of allFiles) {
        const content = await fs.readFile(file, 'utf-8');
        const tags = extractTags(content);
        const { frontmatter } = parseFrontmatter(content);
        const fmTags = Array.isArray(frontmatter.tags) ? frontmatter.tags as string[] : [];

        for (const tag of [...tags, ...fmTags]) {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        }
      }

      const sorted = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1]);

      if (sorted.length === 0) {
        return { content: [{ type: 'text', text: 'No tags found in vault.' }] };
      }

      const formatted = sorted.map(([tag, count]) =>
        `#${tag}: ${count} note${count === 1 ? '' : 's'}`
      ).join('\n');

      return { content: [{ type: 'text', text: `All tags (${sorted.length}):\n\n${formatted}` }] };
    }

    case 'list_recent_notes': {
      const { limit = 10 } = args as { limit?: number };
      const allFiles = await getAllMarkdownFiles(VAULT_PATH);
      const filesWithStats = await Promise.all(
        allFiles.map(async (file) => {
          const stats = await fs.stat(file);
          return {
            path: path.relative(VAULT_PATH, file),
            name: path.basename(file, '.md'),
            modified: stats.mtime,
          };
        })
      );

      const sorted = filesWithStats
        .sort((a, b) => b.modified.getTime() - a.modified.getTime())
        .slice(0, limit);

      const formatted = sorted.map((f, i) =>
        `${i + 1}. **${f.name}**\n   Path: ${f.path}\n   Modified: ${f.modified.toISOString()}`
      ).join('\n\n');

      return { content: [{ type: 'text', text: `Recent notes:\n\n${formatted}` }] };
    }

    case 'get_folder_structure': {
      const { path: folderPath = '', depth = 2 } = args as { path?: string; depth?: number };
      const fullPath = path.join(VAULT_PATH, folderPath);

      if (!await fileExists(fullPath)) {
        return { content: [{ type: 'text', text: `Folder not found: ${folderPath || '(root)'}` }] };
      }

      async function buildTree(dir: string, currentDepth: number, prefix: string = ''): Promise<string> {
        if (currentDepth > depth) return '';

        const entries = await fs.readdir(dir, { withFileTypes: true });
        const lines: string[] = [];

        const folders = entries.filter(e => e.isDirectory() && !e.name.startsWith('.'));
        const files = entries.filter(e => e.isFile() && e.name.endsWith('.md'));

        for (const folder of folders.sort((a, b) => a.name.localeCompare(b.name))) {
          lines.push(`${prefix}📁 ${folder.name}/`);
          const subTree = await buildTree(
            path.join(dir, folder.name),
            currentDepth + 1,
            prefix + '  '
          );
          if (subTree) lines.push(subTree);
        }

        for (const file of files.sort((a, b) => a.name.localeCompare(b.name))) {
          lines.push(`${prefix}📄 ${file.name}`);
        }

        return lines.join('\n');
      }

      const tree = await buildTree(fullPath, 1);
      const header = folderPath ? `Folder: ${folderPath}` : 'Vault structure';

      return { content: [{ type: 'text', text: `${header}\n\n${tree}` }] };
    }

    case 'create_note': {
      const { note_path, content, frontmatter = {}, overwrite = false } = args as {
        note_path: string;
        content: string;
        frontmatter?: Record<string, unknown>;
        overwrite?: boolean;
      };

      const normalizedPath = note_path.endsWith('.md') ? note_path : `${note_path}.md`;
      const fullPath = path.join(VAULT_PATH, normalizedPath);

      // Check if note already exists
      if (!overwrite && await fileExists(fullPath)) {
        return { content: [{ type: 'text', text: `Note already exists: ${normalizedPath}. Use overwrite=true to replace.` }] };
      }

      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await ensureDirectoryExists(parentDir);

      // Build file content with frontmatter
      const frontmatterStr = formatFrontmatter(frontmatter);
      const fileContent = frontmatterStr + content;

      await fs.writeFile(fullPath, fileContent, 'utf-8');

      return {
        content: [{
          type: 'text',
          text: `Created note: ${normalizedPath}`
        }]
      };
    }

    case 'update_note': {
      const { note_path, content, frontmatter } = args as {
        note_path: string;
        content: string;
        frontmatter?: Record<string, unknown>;
      };

      const normalizedPath = note_path.endsWith('.md') ? note_path : `${note_path}.md`;
      const fullPath = path.join(VAULT_PATH, normalizedPath);

      if (!await fileExists(fullPath)) {
        return { content: [{ type: 'text', text: `Note not found: ${normalizedPath}` }] };
      }

      // Read existing note to get current frontmatter if needed
      const existingContent = await fs.readFile(fullPath, 'utf-8');
      const { frontmatter: existingFrontmatter } = parseFrontmatter(existingContent);

      // Merge frontmatter: new values override existing
      const mergedFrontmatter = frontmatter
        ? { ...existingFrontmatter, ...frontmatter }
        : existingFrontmatter;

      // Update the modified date
      mergedFrontmatter.updated = new Date().toISOString();

      // Build file content
      const frontmatterStr = formatFrontmatter(mergedFrontmatter);
      const fileContent = frontmatterStr + content;

      await fs.writeFile(fullPath, fileContent, 'utf-8');

      return {
        content: [{
          type: 'text',
          text: `Updated note: ${normalizedPath}`
        }]
      };
    }

    case 'append_to_note': {
      const { note_path, content, create_if_missing = false } = args as {
        note_path: string;
        content: string;
        create_if_missing?: boolean;
      };

      const normalizedPath = note_path.endsWith('.md') ? note_path : `${note_path}.md`;
      const fullPath = path.join(VAULT_PATH, normalizedPath);

      const exists = await fileExists(fullPath);

      if (!exists && !create_if_missing) {
        return { content: [{ type: 'text', text: `Note not found: ${normalizedPath}. Use create_if_missing=true to create it.` }] };
      }

      if (!exists) {
        // Create new note with content
        const parentDir = path.dirname(fullPath);
        await ensureDirectoryExists(parentDir);
        await fs.writeFile(fullPath, content, 'utf-8');
        return {
          content: [{
            type: 'text',
            text: `Created note and added content: ${normalizedPath}`
          }]
        };
      }

      // Append to existing note
      const existingContent = await fs.readFile(fullPath, 'utf-8');
      const newContent = existingContent.trimEnd() + '\n\n' + content;
      await fs.writeFile(fullPath, newContent, 'utf-8');

      return {
        content: [{
          type: 'text',
          text: `Appended content to: ${normalizedPath}`
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
