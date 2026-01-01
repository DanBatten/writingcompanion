import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Multi-Repo Navigator
// Provides intelligent navigation and analysis across multiple code repositories with context awareness

const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

interface RepoInfo {
  name: string;
  path: string;
  source: 'local' | 'github';
  description?: string;
  language?: string;
  lastCommit?: string;
}

interface FileInfo {
  path: string;
  name: string;
  type: 'file' | 'directory';
  size?: number;
}

interface CommitInfo {
  sha: string;
  message: string;
  author: string;
  date: string;
  files?: string[];
}

async function githubRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${GITHUB_API_BASE}${endpoint}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` }),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`GitHub API error: ${response.status} - ${JSON.stringify(error)}`);
  }

  return response.json() as Promise<T>;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isGitRepo(dir: string): Promise<boolean> {
  return fileExists(path.join(dir, '.git'));
}

async function getGitInfo(repoPath: string): Promise<{ lastCommit: string; branch: string } | null> {
  try {
    const { stdout: lastCommit } = await execAsync(
      'git log -1 --format="%H %s" 2>/dev/null',
      { cwd: repoPath }
    );
    const { stdout: branch } = await execAsync(
      'git rev-parse --abbrev-ref HEAD 2>/dev/null',
      { cwd: repoPath }
    );
    return {
      lastCommit: lastCommit.trim(),
      branch: branch.trim(),
    };
  } catch {
    return null;
  }
}

async function getLocalRepoStructure(
  repoPath: string,
  subPath: string = '',
  depth: number = 2
): Promise<FileInfo[]> {
  const fullPath = path.join(repoPath, subPath);
  const files: FileInfo[] = [];

  if (!await fileExists(fullPath)) {
    return files;
  }

  const entries = await fs.readdir(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    // Skip common non-essential directories
    if (entry.name.startsWith('.') ||
        entry.name === 'node_modules' ||
        entry.name === '__pycache__' ||
        entry.name === 'venv' ||
        entry.name === 'dist' ||
        entry.name === 'build') {
      continue;
    }

    const relativePath = path.join(subPath, entry.name);
    const stats = await fs.stat(path.join(repoPath, relativePath));

    files.push({
      path: relativePath,
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      size: entry.isFile() ? stats.size : undefined,
    });

    if (entry.isDirectory() && depth > 1) {
      const subFiles = await getLocalRepoStructure(repoPath, relativePath, depth - 1);
      files.push(...subFiles);
    }
  }

  return files;
}

async function readLocalFile(repoPath: string, filePath: string): Promise<string> {
  const fullPath = path.join(repoPath, filePath);
  return fs.readFile(fullPath, 'utf-8');
}

async function searchLocalRepo(
  repoPath: string,
  query: string,
  filePattern?: string
): Promise<Array<{ file: string; line: number; content: string }>> {
  const results: Array<{ file: string; line: number; content: string }> = [];

  async function searchDir(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === '__pycache__') {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await searchDir(fullPath);
      } else if (entry.isFile()) {
        // Apply file pattern filter
        if (filePattern && !entry.name.match(new RegExp(filePattern.replace('*', '.*')))) {
          continue;
        }

        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(query.toLowerCase())) {
              results.push({
                file: path.relative(repoPath, fullPath),
                line: i + 1,
                content: lines[i].trim().substring(0, 200),
              });

              if (results.length >= 50) return;
            }
          }
        } catch {
          // Skip binary files or files we can't read
        }
      }
    }
  }

  await searchDir(repoPath);
  return results;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
  }
  return null;
}

const server = new Server(
  { name: 'multi-repo-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_local_repo',
        description: 'Analyze a local git repository to understand its structure, languages, and key files.',
        inputSchema: {
          type: 'object',
          properties: {
            repo_path: {
              type: 'string',
              description: 'Absolute path to the local repository',
            },
            depth: {
              type: 'number',
              description: 'How deep to scan the directory structure (default: 3)',
              default: 3,
            },
          },
          required: ['repo_path'],
        },
      },
      {
        name: 'analyze_github_repo',
        description: 'Analyze a GitHub repository to understand its structure, languages, and metadata.',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (username or organization)',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            branch: {
              type: 'string',
              description: 'Branch to analyze (default: default branch)',
            },
          },
          required: ['owner', 'repo'],
        },
      },
      {
        name: 'read_repo_file',
        description: 'Read the contents of a file from a repository (local or GitHub).',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['local', 'github'],
              description: 'Where to read from',
            },
            repo_path: {
              type: 'string',
              description: 'For local: absolute path. For GitHub: owner/repo format',
            },
            file_path: {
              type: 'string',
              description: 'Path to the file within the repository',
            },
            branch: {
              type: 'string',
              description: 'For GitHub: branch name (default: default branch)',
            },
          },
          required: ['source', 'repo_path', 'file_path'],
        },
      },
      {
        name: 'search_repo',
        description: 'Search for text patterns in a repository.',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['local', 'github'],
              description: 'Where to search',
            },
            repo_path: {
              type: 'string',
              description: 'For local: absolute path. For GitHub: owner/repo format',
            },
            query: {
              type: 'string',
              description: 'Search query',
            },
            file_pattern: {
              type: 'string',
              description: 'File pattern to filter (e.g., "*.ts", "*.py")',
            },
          },
          required: ['source', 'repo_path', 'query'],
        },
      },
      {
        name: 'get_recent_commits',
        description: 'Get recent commits from a repository.',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['local', 'github'],
              description: 'Where to get commits from',
            },
            repo_path: {
              type: 'string',
              description: 'For local: absolute path. For GitHub: owner/repo format',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of commits (default: 10)',
              default: 10,
            },
            branch: {
              type: 'string',
              description: 'Branch to get commits from',
            },
          },
          required: ['source', 'repo_path'],
        },
      },
      {
        name: 'compare_repos',
        description: 'Compare the structure and characteristics of two repositories.',
        inputSchema: {
          type: 'object',
          properties: {
            repo1: {
              type: 'object',
              properties: {
                source: { type: 'string', enum: ['local', 'github'] },
                path: { type: 'string' },
              },
              required: ['source', 'path'],
              description: 'First repository',
            },
            repo2: {
              type: 'object',
              properties: {
                source: { type: 'string', enum: ['local', 'github'] },
                path: { type: 'string' },
              },
              required: ['source', 'path'],
              description: 'Second repository',
            },
          },
          required: ['repo1', 'repo2'],
        },
      },
      {
        name: 'extract_concepts',
        description: 'Extract key concepts, patterns, and architectural decisions from a repository for writing purposes.',
        inputSchema: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['local', 'github'],
              description: 'Repository source',
            },
            repo_path: {
              type: 'string',
              description: 'Repository path',
            },
            focus_areas: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific areas to focus on (e.g., ["architecture", "patterns", "apis"])',
            },
          },
          required: ['source', 'repo_path'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'analyze_local_repo': {
      const { repo_path, depth = 3 } = args as { repo_path: string; depth?: number };

      if (!await fileExists(repo_path)) {
        return { content: [{ type: 'text', text: `Repository not found: ${repo_path}` }] };
      }

      const isGit = await isGitRepo(repo_path);
      const gitInfo = isGit ? await getGitInfo(repo_path) : null;
      const files = await getLocalRepoStructure(repo_path, '', depth);

      // Analyze file types
      const extensions: Map<string, number> = new Map();
      const keyFiles: string[] = [];

      for (const file of files) {
        if (file.type === 'file') {
          const ext = path.extname(file.name);
          if (ext) {
            extensions.set(ext, (extensions.get(ext) || 0) + 1);
          }

          // Identify key files
          const lowerName = file.name.toLowerCase();
          if (['readme.md', 'package.json', 'cargo.toml', 'pyproject.toml',
               'go.mod', 'makefile', 'dockerfile'].includes(lowerName)) {
            keyFiles.push(file.path);
          }
        }
      }

      const topExtensions = Array.from(extensions.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ext, count]) => `${ext}: ${count}`)
        .join(', ');

      let formatted = `# Repository Analysis: ${path.basename(repo_path)}\n\n`;
      formatted += `**Path:** ${repo_path}\n`;
      formatted += `**Git Repository:** ${isGit ? 'Yes' : 'No'}\n`;

      if (gitInfo) {
        formatted += `**Branch:** ${gitInfo.branch}\n`;
        formatted += `**Last Commit:** ${gitInfo.lastCommit}\n`;
      }

      formatted += `\n## File Statistics\n`;
      formatted += `**Total files:** ${files.filter(f => f.type === 'file').length}\n`;
      formatted += `**Directories:** ${files.filter(f => f.type === 'directory').length}\n`;
      formatted += `**Top extensions:** ${topExtensions}\n`;

      if (keyFiles.length > 0) {
        formatted += `\n## Key Files\n`;
        formatted += keyFiles.map(f => `- ${f}`).join('\n');
      }

      formatted += `\n\n## Structure\n`;
      const directories = files.filter(f => f.type === 'directory').slice(0, 20);
      formatted += directories.map(d => `📁 ${d.path}`).join('\n');

      return { content: [{ type: 'text', text: formatted }] };
    }

    case 'analyze_github_repo': {
      const { owner, repo, branch } = args as { owner: string; repo: string; branch?: string };

      const repoInfo = await githubRequest<Record<string, unknown>>(`/repos/${owner}/${repo}`);

      const defaultBranch = branch || repoInfo.default_branch as string;

      const languages = await githubRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);

      const contents = await githubRequest<Array<Record<string, unknown>>>(
        `/repos/${owner}/${repo}/contents?ref=${defaultBranch}`
      );

      let formatted = `# Repository Analysis: ${owner}/${repo}\n\n`;
      formatted += `**Description:** ${repoInfo.description || '(none)'}\n`;
      formatted += `**Default Branch:** ${defaultBranch}\n`;
      formatted += `**Stars:** ${repoInfo.stargazers_count}\n`;
      formatted += `**Forks:** ${repoInfo.forks_count}\n`;
      formatted += `**Created:** ${repoInfo.created_at}\n`;
      formatted += `**Last Updated:** ${repoInfo.updated_at}\n`;

      formatted += `\n## Languages\n`;
      const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
      for (const [lang, bytes] of Object.entries(languages)) {
        const percent = ((bytes / totalBytes) * 100).toFixed(1);
        formatted += `- ${lang}: ${percent}%\n`;
      }

      formatted += `\n## Root Contents\n`;
      for (const item of contents.slice(0, 20)) {
        const icon = item.type === 'dir' ? '📁' : '📄';
        formatted += `${icon} ${item.name}\n`;
      }

      return { content: [{ type: 'text', text: formatted }] };
    }

    case 'read_repo_file': {
      const { source, repo_path, file_path, branch } = args as {
        source: 'local' | 'github';
        repo_path: string;
        file_path: string;
        branch?: string;
      };

      let content: string;

      if (source === 'local') {
        content = await readLocalFile(repo_path, file_path);
      } else {
        const [owner, repo] = repo_path.split('/');
        const ref = branch || 'HEAD';
        const response = await githubRequest<{ content: string; encoding: string }>(
          `/repos/${owner}/${repo}/contents/${file_path}?ref=${ref}`
        );

        if (response.encoding === 'base64') {
          content = Buffer.from(response.content, 'base64').toString('utf-8');
        } else {
          content = response.content;
        }
      }

      return {
        content: [{
          type: 'text',
          text: `# ${file_path}\n\n\`\`\`\n${content}\n\`\`\``
        }]
      };
    }

    case 'search_repo': {
      const { source, repo_path, query, file_pattern } = args as {
        source: 'local' | 'github';
        repo_path: string;
        query: string;
        file_pattern?: string;
      };

      if (source === 'local') {
        const results = await searchLocalRepo(repo_path, query, file_pattern);

        if (results.length === 0) {
          return { content: [{ type: 'text', text: `No results found for "${query}"` }] };
        }

        const formatted = results.map(r =>
          `**${r.file}:${r.line}**\n${r.content}`
        ).join('\n\n');

        return { content: [{ type: 'text', text: `Found ${results.length} matches:\n\n${formatted}` }] };
      } else {
        const [owner, repo] = repo_path.split('/');
        let searchQuery = `${query} repo:${owner}/${repo}`;
        if (file_pattern) {
          searchQuery += ` path:${file_pattern}`;
        }

        const response = await githubRequest<{ items: Array<Record<string, unknown>> }>(
          `/search/code?q=${encodeURIComponent(searchQuery)}`
        );

        if (response.items.length === 0) {
          return { content: [{ type: 'text', text: `No results found for "${query}"` }] };
        }

        const formatted = response.items.slice(0, 20).map(item =>
          `**${item.path}**\n${item.html_url}`
        ).join('\n\n');

        return { content: [{ type: 'text', text: `Found ${response.items.length} matches:\n\n${formatted}` }] };
      }
    }

    case 'get_recent_commits': {
      const { source, repo_path, limit = 10, branch } = args as {
        source: 'local' | 'github';
        repo_path: string;
        limit?: number;
        branch?: string;
      };

      const commits: CommitInfo[] = [];

      if (source === 'local') {
        const branchArg = branch ? branch : '';
        const { stdout } = await execAsync(
          `git log ${branchArg} -${limit} --format="%H|%s|%an|%ai" 2>/dev/null`,
          { cwd: repo_path }
        );

        for (const line of stdout.trim().split('\n')) {
          if (!line) continue;
          const [sha, message, author, date] = line.split('|');
          commits.push({ sha, message, author, date });
        }
      } else {
        const [owner, repo] = repo_path.split('/');
        const sha = branch || '';
        const response = await githubRequest<Array<Record<string, unknown>>>(
          `/repos/${owner}/${repo}/commits?per_page=${limit}${sha ? `&sha=${sha}` : ''}`
        );

        for (const commit of response) {
          const commitData = commit.commit as Record<string, unknown>;
          const authorData = commitData.author as Record<string, string>;
          commits.push({
            sha: (commit.sha as string).substring(0, 7),
            message: (commitData.message as string).split('\n')[0],
            author: authorData.name,
            date: authorData.date,
          });
        }
      }

      const formatted = commits.map(c =>
        `**${c.sha.substring(0, 7)}** - ${c.message}\n   ${c.author} | ${c.date}`
      ).join('\n\n');

      return { content: [{ type: 'text', text: `Recent commits:\n\n${formatted}` }] };
    }

    case 'compare_repos': {
      const { repo1, repo2 } = args as {
        repo1: { source: 'local' | 'github'; path: string };
        repo2: { source: 'local' | 'github'; path: string };
      };

      const getRepoStats = async (source: string, repoPath: string) => {
        if (source === 'local') {
          const files = await getLocalRepoStructure(repoPath, '', 3);
          const extensions: Map<string, number> = new Map();

          for (const file of files) {
            if (file.type === 'file') {
              const ext = path.extname(file.name);
              if (ext) extensions.set(ext, (extensions.get(ext) || 0) + 1);
            }
          }

          return {
            name: path.basename(repoPath),
            fileCount: files.filter(f => f.type === 'file').length,
            dirCount: files.filter(f => f.type === 'directory').length,
            extensions: Array.from(extensions.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5),
          };
        } else {
          const [owner, repo] = repoPath.split('/');
          const repoInfo = await githubRequest<Record<string, unknown>>(`/repos/${owner}/${repo}`);
          const languages = await githubRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);

          return {
            name: `${owner}/${repo}`,
            fileCount: repoInfo.size as number,
            stars: repoInfo.stargazers_count as number,
            extensions: Object.entries(languages).slice(0, 5).map(([lang, bytes]) => [lang, bytes] as [string, number]),
          };
        }
      };

      const [stats1, stats2] = await Promise.all([
        getRepoStats(repo1.source, repo1.path),
        getRepoStats(repo2.source, repo2.path),
      ]);

      let formatted = `# Repository Comparison\n\n`;
      formatted += `## ${stats1.name}\n`;
      formatted += `- Files: ${stats1.fileCount}\n`;
      formatted += `- Top languages: ${stats1.extensions.map(([e]) => e).join(', ')}\n\n`;

      formatted += `## ${stats2.name}\n`;
      formatted += `- Files: ${stats2.fileCount}\n`;
      formatted += `- Top languages: ${stats2.extensions.map(([e]) => e).join(', ')}\n`;

      return { content: [{ type: 'text', text: formatted }] };
    }

    case 'extract_concepts': {
      const { source, repo_path, focus_areas = [] } = args as {
        source: 'local' | 'github';
        repo_path: string;
        focus_areas?: string[];
      };

      const concepts: string[] = [];

      // Look for key documentation and config files
      const keyFiles = [
        'README.md',
        'ARCHITECTURE.md',
        'CONTRIBUTING.md',
        'package.json',
        'tsconfig.json',
        'Cargo.toml',
        'pyproject.toml',
        'go.mod',
      ];

      let readmeContent = '';

      if (source === 'local') {
        for (const file of keyFiles) {
          try {
            const content = await readLocalFile(repo_path, file);
            if (file.toLowerCase() === 'readme.md') {
              readmeContent = content;
            }

            // Extract headers and key sections
            if (file.endsWith('.md')) {
              const headers = content.match(/^#{1,3}\s+.+$/gm) || [];
              concepts.push(...headers.slice(0, 10));
            }

            // Extract dependencies for tech stack
            if (file === 'package.json') {
              const pkg = JSON.parse(content);
              if (pkg.dependencies) {
                concepts.push(`Dependencies: ${Object.keys(pkg.dependencies).slice(0, 10).join(', ')}`);
              }
            }
          } catch {
            // File not found, skip
          }
        }
      } else {
        const [owner, repo] = repo_path.split('/');
        try {
          const readmeResponse = await githubRequest<{ content: string }>(`/repos/${owner}/${repo}/readme`);
          readmeContent = Buffer.from(readmeResponse.content, 'base64').toString('utf-8');
          const headers = readmeContent.match(/^#{1,3}\s+.+$/gm) || [];
          concepts.push(...headers.slice(0, 10));
        } catch {
          // No README
        }

        const languages = await githubRequest<Record<string, number>>(`/repos/${owner}/${repo}/languages`);
        concepts.push(`Languages: ${Object.keys(languages).join(', ')}`);
      }

      let formatted = `# Extracted Concepts\n\n`;

      if (concepts.length > 0) {
        formatted += `## Key Topics\n`;
        formatted += concepts.map(c => `- ${c}`).join('\n');
      }

      if (readmeContent) {
        formatted += `\n\n## README Summary\n`;
        formatted += readmeContent.substring(0, 1500);
        if (readmeContent.length > 1500) {
          formatted += '\n\n... (truncated)';
        }
      }

      if (focus_areas.length > 0) {
        formatted += `\n\n## Focus Areas Requested\n`;
        formatted += focus_areas.map(a => `- ${a}`).join('\n');
        formatted += `\n\n*Note: Use read_repo_file to examine specific files related to these areas.*`;
      }

      return { content: [{ type: 'text', text: formatted }] };
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
