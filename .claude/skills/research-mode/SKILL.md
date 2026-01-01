---
name: "research-mode"
description: "Manages deep research sessions, concept exploration, and idea development without writing pressure. Facilitates connections between disparate concepts and progressive thinking."
version: "0.2.0"
---

# Research Mode Controller

Manages deep research sessions, concept exploration, and idea development without writing pressure. Facilitates connections between disparate concepts and progressive thinking.

## Purpose

Enable focused ideation and research sessions that build conceptual understanding before writing. This mode prioritizes exploration, connection-making, and depth over structured output.

## Instructions

When the user activates research mode, follow these principles:

### Session Initialization

1. **Acknowledge the research context**: Ask what topic, question, or area the user wants to explore
2. **Identify knowledge sources**: Determine which sources to tap into:
   - Personal content-capture database (articles, papers, saved content)
   - Obsidian vault (personal notes, linked ideas)
   - Notion workspace (structured notes, project documentation)
   - Code repositories (if exploring technical concepts)
   - **Web search** (for current information, new perspectives, and external validation)

3. **Establish session goals**: Help the user articulate what they're trying to understand or discover without forcing them into specific deliverables

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

Leverage the available tools for research:

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

**Obsidian Vault MCP**
- `search_notes`: Find relevant personal notes
- `get_linked_notes`: Follow connections between ideas
- `list_all_tags`: Discover topic clusters

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

#### 5. Track Sources
Throughout research, maintain awareness of sources for later citation:
- Note URLs and titles of valuable web pages
- Track which insights came from which sources
- Distinguish between personal knowledge and external research

### Research Patterns

**Expanding Understanding**
```
1. User asks about topic X
2. Search personal knowledge bases first
3. Identify gaps or questions
4. Web search to fill gaps
5. Deep-read promising pages
6. Synthesize personal + web findings
7. Present integrated understanding
```

**Validating Ideas**
```
1. User has a hypothesis or idea
2. Find supporting evidence in personal knowledge
3. Web search for external validation
4. Specifically search for counterarguments
5. Present balanced view with sources
```

**Exploring New Territory**
```
1. Topic is outside personal knowledge
2. Web search for foundational understanding
3. Identify key concepts and terminology
4. Search for expert perspectives
5. Build mental model from external sources
6. Connect back to what user already knows
```

### Session Flow

1. **Opening**: Establish the research question or area
2. **Personal source scan**: Check content-capture, Obsidian, Notion for existing knowledge
3. **Gap identification**: What's missing? What needs validation?
4. **Web research**: Fill gaps with targeted searches and deep reads
5. **Exploration loops**:
   - Present findings (personal + web)
   - Discuss implications
   - Identify new questions
   - Research further (web or personal sources as needed)
6. **Synthesis checkpoints**: Periodically consolidate understanding with source attribution
7. **Transition readiness**: When the user has sufficient understanding, note readiness to transition to writing mode

### What NOT to Do

- Don't push toward producing an outline or draft
- Don't impose structure before the user is ready
- Don't rush to conclusions; let understanding develop
- Don't ignore tangents that might lead to insights
- Don't treat research as a checklist to complete
- Don't rely solely on personal knowledge when web research would help
- Don't present web findings without noting the source
- Don't accept a single web source as definitive; seek multiple perspectives

### Transition to Writing Mode

When research feels complete, offer to transition:
- Summarize the key concepts and connections discovered
- Note which sources (personal vs web) contributed to understanding
- Identify the strongest threads for potential writing
- Compile key sources for citation in writing
- Ask if the user wants to switch to writing mode
- If yes, invoke the `/writing-mode` skill with research context and sources

## Usage

Activate with: `/research-mode`

Example invocations:
- `/research-mode` - Start a new research session
- `/research-mode "distributed systems patterns"` - Start with a specific topic
- `/research-mode continue` - Resume from previous research context

The skill works best when the user approaches it with genuine curiosity rather than a specific deliverable in mind. The goal is understanding, not output.

### Web Research Examples

```
User: /research-mode "agentic AI patterns"

Claude:
1. Searches content-capture for saved articles on AI agents
2. Checks Obsidian for personal notes on the topic
3. Web searches: "agentic AI patterns 2024", "AI agent architectures"
4. Deep-reads top results from reputable sources
5. Presents synthesis: "Here's what I found across your notes and current web sources..."
```

```
User: "I think microservices are always better than monoliths"

Claude:
1. Acknowledges the position
2. Searches for supporting evidence in personal knowledge
3. Web searches: "microservices vs monolith", "monolith advantages", "microservices criticism"
4. Presents balanced view with sources on both sides
5. Helps user develop more nuanced understanding
```
