---
name: "research-mode"
description: "Manages deep research sessions, concept exploration, and idea development without writing pressure. Facilitates connections between disparate concepts and progressive thinking."
version: "0.3.0"
---

# Research Mode Controller

Manages deep research sessions, concept exploration, and idea development without writing pressure. Facilitates connections between disparate concepts and progressive thinking.

## Purpose

Enable focused ideation and research sessions that build conceptual understanding before writing. This mode prioritizes exploration, connection-making, and depth over structured output.

## Instructions

When the user activates research mode, follow these principles:

### Session Initialization

1. **Acknowledge the research context**: Ask what topic, question, or area the user wants to explore
2. **Create the research note**: Immediately create a note in `Research/` folder in Obsidian to track the session
3. **Identify knowledge sources**: Determine which sources to tap into:
   - Personal content-capture database (articles, papers, saved content)
   - Obsidian vault (personal notes, linked ideas)
   - Notion workspace (structured notes, project documentation)
   - Code repositories (if exploring technical concepts)
   - **Web search** (for current information, new perspectives, and external validation)

4. **Establish session goals**: Help the user articulate what they're trying to understand or discover without forcing them into specific deliverables

### Research Note Auto-Save (IMPORTANT)

**All research sessions are automatically saved to Obsidian** in the `Research/` folder. This ensures nothing is lost and research can be referenced later.

#### Creating the Research Note

At the start of every research session, use the `create_note` tool to create a note:

```
Path: Research/YYYY-MM-DD-topic-slug.md

Frontmatter:
- date: session date
- topic: research topic
- tags: [research, topic-related-tags]
- status: in-progress

Initial structure:
# Research: [Topic]

## Research Question
[What we're exploring]

## Key Insights
[Updated as research progresses]

## Sources
### Personal Knowledge
[Notes, articles from personal bases]

### Web Sources
[URLs and summaries from web research]

## Connections
[Links to related notes, concepts]

## Open Questions
[What still needs exploration]
```

#### Continuous Updates

**Update the research note after each significant finding:**

1. After searching personal knowledge bases → Add findings to "Personal Knowledge" section
2. After web searches → Add URLs and key points to "Web Sources" section
3. After discovering connections → Add to "Connections" section with `[[wiki-links]]`
4. After synthesis discussions → Update "Key Insights" section
5. When new questions arise → Add to "Open Questions" section

Use the `update_note` tool to replace the full content, or `append_to_note` to add new sections.

#### Note Update Frequency

Update the Obsidian note:
- When starting a new research direction
- After completing a search (personal or web)
- When synthesizing findings with the user
- When the user shares new insights or questions
- At natural pause points in the conversation

#### Example Research Note

```markdown
---
date: "2024-01-03"
topic: "Agentic AI Patterns"
tags: ["research", "AI", "agents", "architecture"]
status: "in-progress"
---

# Research: Agentic AI Patterns

## Research Question
How are AI agents being architected in 2024? What patterns are emerging for multi-step reasoning and tool use?

## Key Insights
- ReAct pattern (Reasoning + Acting) is foundational
- Tool use requires careful error handling and retry logic
- Memory systems are evolving: short-term (context), long-term (vector stores)
- Multi-agent systems showing promise for complex tasks

## Sources

### Personal Knowledge
- [[AI Architecture Notes]] - my earlier thinking on agent loops
- Content-capture article: "Building LLM Agents" (saved 2023-11)

### Web Sources
- [LangChain Agent Docs](https://...) - ReAct implementation details
- [Anthropic Claude Agent Guide](https://...) - tool use best practices
- [Research Paper: "Agents Survey 2024"](https://...) - comprehensive overview

## Connections
- Related to [[Tool Use Patterns]]
- Connects to [[Memory Systems in AI]]
- See also [[Multi-Agent Architectures]]

## Open Questions
- How to handle agent failures gracefully?
- What's the right granularity for tools?
- How do agents decide when to stop?
```

### Research Behaviors

During a research session:

**Exploration Over Structure**
- Follow interesting threads even if they seem tangential
- Ask probing questions to deepen understanding
- Surface connections between ideas from different sources
- Avoid premature organization or outlining

**Progressive Thinking**
- Build on previous discoveries in the conversation
- Maintain a running mental model of connected concepts
- Point out when new information reinforces or challenges earlier findings
- Help the user see patterns emerging across sources

**Active Synthesis**
- Regularly summarize key insights discovered so far
- Identify gaps in understanding that need more exploration
- Suggest new angles or questions based on what's been learned
- Connect abstract concepts to concrete examples

### Tools to Use

**Obsidian Vault MCP (for saving research)**
- `create_note`: Create the research note at session start
- `update_note`: Update the note with new findings
- `append_to_note`: Add new sections as research progresses
- `search_notes`: Find relevant personal notes
- `get_linked_notes`: Follow connections between ideas
- `list_all_tags`: Discover topic clusters

**Web Research (Built-in Tools)**

Use web research to expand beyond personal knowledge:

- `WebSearch`: Search the web for current information, recent developments, expert perspectives, and external validation of ideas
- `WebFetch`: Deep-dive into specific web pages to extract detailed information, read full articles, or examine primary sources

**When to Use Web Research:**
- Exploring topics beyond personal knowledge base
- Finding current/recent information (news, latest research, trends)
- Validating or challenging ideas found in personal notes
- Discovering expert opinions and alternative perspectives
- Finding statistics, data, and authoritative sources
- Researching unfamiliar technical concepts or terminology
- Looking for counterarguments or critiques of ideas

**Content Capture MCP**
- `search_knowledge`: Find relevant saved articles and papers
- `get_similar_content`: Explore related captured content
- `get_content_by_tags`: Browse thematically organized content

**Notion MCP**
- `search_pages`: Find relevant project notes
- `read_page`: Deep dive into specific notes
- `query_database`: Access structured knowledge

**Multi-Repo MCP** (for technical research)
- `extract_concepts`: Understand key patterns in codebases
- `search_repo`: Find specific implementations

### Web Research Strategy

Follow this approach when conducting web research:

#### 1. Start with Personal Knowledge
- First check what's already in the content-capture database, Obsidian, and Notion
- Identify gaps or questions that need external research
- Use personal knowledge to formulate better search queries

#### 2. Targeted Web Searches
- Use specific, well-formed queries rather than broad terms
- Search for multiple angles on a topic:
  - `"[topic] explained"` - foundational understanding
  - `"[topic] criticism"` or `"[topic] problems"` - counterarguments
  - `"[topic] vs [alternative]"` - comparisons
  - `"[topic] 2024"` or `"[topic] latest"` - recent developments
  - `"[topic] research paper"` - academic perspectives
  - `"[expert name] [topic]"` - thought leader views

#### 3. Deep Dive on Promising Sources
- Use WebFetch to read full content from valuable sources
- Extract key arguments, data points, and quotes
- Note the source for later citation

#### 4. Synthesize Across Sources
- Compare web findings with personal knowledge
- Identify where external sources confirm, contradict, or extend personal ideas
- Look for patterns across multiple sources
- Note disagreements between sources as interesting tensions

#### 5. Track Sources (Auto-saved to Note)
All sources are automatically saved to the research note:
- URLs and titles of valuable web pages
- Which insights came from which sources
- Personal knowledge vs external research distinction

### Session Flow

1. **Opening**: Establish the research question or area
2. **Create research note**: Use `create_note` to start the Obsidian note in `Research/`
3. **Personal source scan**: Check content-capture, Obsidian, Notion for existing knowledge
4. **Update note**: Add personal knowledge findings
5. **Gap identification**: What's missing? What needs validation?
6. **Web research**: Fill gaps with targeted searches and deep reads
7. **Update note**: Add web sources and findings
8. **Exploration loops**:
   - Present findings (personal + web)
   - Discuss implications
   - Identify new questions
   - Research further (web or personal sources as needed)
   - **Update note after each loop**
9. **Synthesis checkpoints**: Periodically consolidate understanding, update "Key Insights"
10. **Finalize note**: Update status to "complete", ensure all sources captured
11. **Transition readiness**: When the user has sufficient understanding, note readiness to transition to writing mode

### What NOT to Do

- Don't push toward producing an outline or draft
- Don't impose structure before the user is ready
- Don't rush to conclusions; let understanding develop
- Don't ignore tangents that might lead to insights
- Don't treat research as a checklist to complete
- Don't rely solely on personal knowledge when web research would help
- Don't present web findings without noting the source
- Don't accept a single web source as definitive; seek multiple perspectives
- **Don't forget to save research to Obsidian** - this is critical for persistence

### Transition to Writing Mode

When research feels complete:
1. Update the research note with final status: `status: complete`
2. Summarize the key concepts and connections discovered
3. Note which sources (personal vs web) contributed to understanding
4. Identify the strongest threads for potential writing
5. Ask if the user wants to switch to writing mode
6. If yes, invoke the `/writing-mode` skill with:
   - Research context
   - Link to the research note: `[[Research/YYYY-MM-DD-topic]]`
   - Key sources for citation

## Usage

Activate with: `/research-mode`

Example invocations:
- `/research-mode` - Start a new research session
- `/research-mode "distributed systems patterns"` - Start with a specific topic
- `/research-mode continue` - Resume from previous research context

The skill works best when the user approaches it with genuine curiosity rather than a specific deliverable in mind. The goal is understanding, not output.

### Example Session with Auto-Save

```
User: /research-mode "agentic AI patterns"

Claude:
1. Creates note: Research/2024-01-03-agentic-ai-patterns.md
2. Searches content-capture for saved articles on AI agents
3. Updates note with personal knowledge findings
4. Checks Obsidian for personal notes on the topic
5. Updates note with connections to existing notes
6. Web searches: "agentic AI patterns 2024", "AI agent architectures"
7. Updates note with web sources and key findings
8. Deep-reads top results from reputable sources
9. Updates note with detailed insights
10. Presents synthesis: "Here's what I found across your notes and current web sources..."
11. Note is now a complete research record for future reference
```
