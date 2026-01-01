---
name: "concept-web-builder"
description: "Creates dynamic connections between ideas from different knowledge sources, identifying patterns and relationships for deeper insights."
version: "0.1.0"
---

# Concept Web Builder

Creates dynamic connections between ideas from different knowledge sources, identifying patterns and relationships for deeper insights.

## Purpose

Surface non-obvious connections between personal knowledge, current projects, and external research to spark innovative thinking. This skill acts as a pattern-finding engine across disparate sources.

## Instructions

When the user activates concept web building, follow these principles:

### Session Initialization

1. **Identify the seed concepts**: What ideas, topics, or questions should anchor the web?
2. **Determine scope**:
   - Which knowledge sources to include?
   - How broad or focused should connections be?
   - Are there specific domains to bridge?
3. **Clarify the goal**:
   - Finding unexpected connections?
   - Validating a hypothesis about relationships?
   - Exploring a new intersection of ideas?

### Connection-Finding Process

#### Phase 1: Source Mining

Gather relevant material from multiple sources:

**Personal Knowledge**
- Search Obsidian vault for notes on seed concepts
- Follow wiki-links to discover connected notes
- Identify tag clusters that might relate

**Captured Content**
- Find articles/papers semantically similar to seed concepts
- Look for content tagged with related themes
- Pull content that shares sources with seed concepts

**Project Context**
- If relevant, examine code repositories for related patterns
- Check Notion for project documentation that touches on concepts

#### Phase 2: Pattern Recognition

Analyze gathered material for:

**Structural Patterns**
- Similar architectures or approaches across domains
- Recurring problems with analogous solutions
- Shared vocabulary indicating conceptual overlap

**Temporal Patterns**
- Ideas that evolved similarly over time
- Concepts that emerged from the same zeitgeist
- Parallel developments in different fields

**Causal Patterns**
- Ideas that influence each other
- Concepts that are prerequisites for others
- Feedback loops between related ideas

#### Phase 3: Connection Synthesis

Present findings as a concept web:

```
Concept Web: [Seed Topic]

Core Nodes:
├── [Primary Concept A]
│   ├── Connected to: [Concept B] via [relationship type]
│   └── Connected to: [Concept C] via [relationship type]
├── [Primary Concept B]
│   └── ...

Key Bridges:
1. [Concept X] ↔ [Concept Y]: [explanation of connection]
2. ...

Surprising Connections:
- [Unexpected link and why it matters]

Gaps/Questions:
- Areas where connections might exist but evidence is thin
```

### Types of Connections to Surface

**Analogical**
- "X in domain A is like Y in domain B"
- Pattern transfer opportunities
- Metaphors that unlock understanding

**Evolutionary**
- How one concept gave rise to another
- Historical development paths
- Genealogies of ideas

**Oppositional**
- Concepts in productive tension
- Dialectical relationships
- Complementary opposites

**Compositional**
- How smaller concepts combine into larger ones
- Building blocks and emergent properties
- Part-whole relationships

**Causal**
- Dependencies between concepts
- Influence relationships
- Enabling conditions

### Tools to Use

**Cross-Source Discovery**

1. **Content Capture MCP**
   - `search_knowledge`: Semantic search across saved content
   - `get_similar_content`: Find related items to expand the web
   - `get_content_by_tags`: Explore thematic clusters

2. **Obsidian Vault MCP**
   - `get_linked_notes`: Follow existing connections
   - `search_notes`: Find related personal notes
   - `list_all_tags`: Discover topic organization

3. **Notion MCP**
   - `search_pages`: Find project documentation
   - `query_database`: Access structured knowledge

4. **Multi-Repo MCP** (for technical concepts)
   - `extract_concepts`: Find patterns in codebases
   - `compare_repos`: Identify shared approaches

### Output Formats

**Visual Description** (default)
```
[Concept A] ←——analogous——→ [Concept B]
     ↓                           ↓
   leads to                   enables
     ↓                           ↓
[Concept C] ←——shares root——→ [Concept D]
```

**Narrative Summary**
Prose explanation of the key connections discovered and their significance.

**Research Directions**
List of questions or areas warranting further exploration based on the connections found.

**Writing Seeds**
Potential article or essay angles that emerge from the connection map.

### Interactive Exploration

After presenting initial connections:

1. **Drill down**: User can request deeper exploration of any connection
2. **Expand nodes**: Add new concepts to the web
3. **Prune**: Remove less relevant connections to focus
4. **Bridge**: Explicitly request connections between two specific concepts
5. **Export**: Save the concept web to Notion or Obsidian

### What NOT to Do

- Don't force connections where they don't exist
- Don't present obvious relationships as insights
- Don't overwhelm with too many connections at once
- Don't ignore contradictions or tensions (they're often most interesting)
- Don't treat the web as static; it should evolve with exploration

### Integration with Other Skills

**From /research-mode**
- Accept research findings and find connections within them
- Identify patterns the research session might have missed

**To /writing-mode**
- Provide the concept web as raw material for writing
- Suggest narrative arcs based on connections

**With /code-project-analyzer**
- Map technical concepts to broader ideas
- Find non-technical analogues for technical patterns

## Usage

Activate with: `/concept-web-builder`

Example invocations:
- `/concept-web-builder` - Start fresh, will ask for seed concepts
- `/concept-web-builder "distributed systems" "organizational design"` - Bridge two domains
- `/concept-web-builder expand [concept]` - Add a concept to existing web
- `/concept-web-builder bridge [A] [B]` - Explicitly connect two concepts

The skill excels at revealing hidden connections that can inform both research direction and writing structure.
