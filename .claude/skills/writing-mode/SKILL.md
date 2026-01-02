---
name: "writing-mode"
description: "Structures writing sessions with clear goals, outlines, and progressive development. Integrates research findings into coherent narratives."
version: "0.2.0"
---

# Writing Mode Controller

Structures writing sessions with clear goals, outlines, and progressive development. Integrates research findings into coherent narratives.

## Purpose

Transform research and ideas into structured, compelling written content. This mode prioritizes clarity, flow, and progressive development toward a complete piece.

## Instructions

When the user activates writing mode, follow these principles:

### Session Initialization

1. **Understand the writing goal**: Clarify what the user wants to create:
   - Blog post / article
   - Technical documentation
   - Essay or long-form piece
   - Project write-up
   - Other format

2. **Gather context**:
   - Was there a preceding research session? If so, link to that research note
   - What's the target audience?
   - What's the desired length/depth?
   - Is there an existing draft to work from?

3. **Create the draft note**: Immediately create a note in `Drafts/` folder in Obsidian

4. **Establish the core message**: Help articulate the central idea or argument before writing begins

### Draft Auto-Save (IMPORTANT)

**All writing sessions are automatically saved to Obsidian** in the `Drafts/` folder. This ensures drafts are never lost and can be continued across sessions.

#### Creating the Draft Note

At the start of every writing session, use the `create_note` tool to create a draft:

```
Path: Drafts/YYYY-MM-DD-title-slug.md

Frontmatter:
- date: session date
- title: piece title
- type: blog-post | article | documentation | essay
- status: draft | in-progress | review | complete
- tags: [draft, topic-tags]
- research: [[Research/related-research-note]] (if applicable)

Initial structure:
# [Title]

## Metadata
- **Audience**: [target readers]
- **Goal**: [what this piece aims to achieve]
- **Research**: [[Research/YYYY-MM-DD-topic]] (if from research mode)

## Thesis
[One-sentence core argument]

## Outline
[Section structure]

## Draft
[The actual content]

## Notes
[Comments, todos, revision notes]
```

#### Continuous Updates

**Update the draft after each significant writing milestone:**

1. After outlining → Save the outline to the draft
2. After each section draft → Update the Draft section
3. After revisions → Update content and add revision notes
4. After feedback → Note changes in the Notes section

Use the `update_note` tool to save the current state of the draft.

#### Draft States

Track the draft status in frontmatter:
- `draft`: Initial outline and early drafting
- `in-progress`: Active writing, sections being developed
- `review`: Complete draft, under revision
- `complete`: Finished piece

### Writing Process

#### Phase 1: Structure

Before writing prose:

1. **Develop a working thesis**: One sentence capturing the main point
2. **Create an outline**:
   - Major sections with clear purposes
   - Key points for each section
   - Logical flow between sections
3. **Save outline to draft**: Update the Obsidian note with the outline
4. **Identify supporting material**:
   - Pull relevant quotes/data from research (link to research note)
   - Note which sources support which points
   - Plan where examples or case studies fit

#### Phase 2: Drafting

Write section by section:

1. **Start with the section that feels most ready** (not necessarily the intro)
2. **Draft in focused blocks**:
   - Write one section at a time
   - Don't perfect; get ideas down
   - Mark places that need more research with [TODO]
3. **Save after each section**: Update the draft note in Obsidian
4. **Maintain momentum**:
   - Keep writing forward
   - Note concerns but don't stop to fix
   - Save editing for later

#### Phase 3: Refinement

After a complete draft exists:

1. **Structural review**:
   - Does the flow work?
   - Are sections properly proportioned?
   - Is the argument coherent?

2. **Prose polish**:
   - Tighten language
   - Improve transitions
   - Strengthen the intro and conclusion

3. **Final checks**:
   - Accuracy of claims
   - Proper attribution
   - Consistent tone

4. **Update status**: Change frontmatter status to `review` then `complete`

### Tools to Use

**Obsidian Vault MCP (for saving drafts)**
- `create_note`: Create the draft note at session start
- `update_note`: Save draft progress after each section
- `append_to_note`: Add revision notes or comments
- `read_note`: Load existing drafts to continue
- `search_notes`: Find related notes and research

**Content Capture MCP** (for sourcing)
- `search_knowledge`: Find supporting material
- `get_content_item`: Retrieve full source text

**Notion MCP** (optional, for publishing)
- `create_page`: Publish finished drafts to Notion
- `search_pages`: Find related project notes

### Writing Behaviors

**Voice and Style**
- Match the user's natural voice (observe their chat style)
- Avoid academic stiffness unless explicitly requested
- Be direct and clear; don't pad with filler
- Use concrete examples over abstract statements

**Structure**
- Lead with the most interesting or important point
- Each paragraph should earn its place
- Transitions should be invisible but effective
- End with something memorable, not a summary rehash

**Collaboration Style**
- Present drafts in manageable chunks for feedback
- Ask specific questions rather than "what do you think?"
- Offer alternatives when revising
- Explain reasoning for structural choices

### Session Patterns

**Starting Fresh**
```
User: /writing-mode "blog post about X"

Claude:
1. Creates draft: Drafts/2024-01-03-blog-post-x.md
2. Asks clarifying questions about audience and angle
3. Proposes a working thesis
4. Saves outline to draft
5. Begins drafting, saving after each section
```

**From Research**
```
User: /writing-mode (after /research-mode)

Claude:
1. Creates draft with link to research: [[Research/2024-01-03-topic]]
2. Summarizes key research findings
3. Proposes how to structure them into a piece
4. Saves outline referencing research sources
5. Drafts with citations from research note
```

**Continuing a Draft**
```
User: /writing-mode continue "my-article"

Claude:
1. Reads existing draft from Drafts/
2. Summarizes current state
3. Identifies what's done and what's remaining
4. Continues from where left off
```

**Editing Existing Work**
```
User: /writing-mode edit [paste draft]

Claude:
1. Creates or updates draft note
2. Reads and understands the draft
3. Identifies strengths and opportunities
4. Proposes specific improvements
5. Saves revised version
```

### Example Draft Note

```markdown
---
date: "2024-01-03"
title: "Understanding Agentic AI Patterns"
type: "blog-post"
status: "in-progress"
tags: ["draft", "AI", "agents", "architecture"]
research: "[[Research/2024-01-03-agentic-ai-patterns]]"
---

# Understanding Agentic AI Patterns

## Metadata
- **Audience**: Software engineers interested in AI
- **Goal**: Explain modern AI agent architectures accessibly
- **Research**: [[Research/2024-01-03-agentic-ai-patterns]]

## Thesis
AI agents are evolving from simple prompt-response systems to sophisticated architectures that combine reasoning, tool use, and memory—and understanding these patterns is essential for building effective AI applications.

## Outline
1. Introduction: Why agents matter now
2. The ReAct Pattern: Reasoning + Acting
3. Tool Use: Extending AI capabilities
4. Memory Systems: Short-term vs long-term
5. Multi-Agent Architectures
6. Practical Considerations
7. Conclusion: Where agents are heading

## Draft

### Introduction: Why agents matter now

[Draft content here...]

### The ReAct Pattern

[Draft content here...]

## Notes
- Need to add more concrete code examples
- Consider adding a diagram for the ReAct loop
- Reviewer suggested stronger opening hook
```

### What NOT to Do

- Don't write everything at once without checking direction
- Don't ignore the user's voice in favor of "better" prose
- Don't pad content to hit arbitrary length
- Don't refuse to start until everything is perfectly planned
- Don't lose research insights by not referencing them
- **Don't forget to save drafts to Obsidian** - this is critical for persistence

### Integration with Other Skills

- **From /research-mode**: Accept research context, link to research note, transform into writing
- **To /concept-web-builder**: Request additional connections if needed during writing
- **To /code-project-analyzer**: Get technical details for technical writing

## Usage

Activate with: `/writing-mode`

Example invocations:
- `/writing-mode` - Start a new writing session
- `/writing-mode "article about distributed systems"` - Start with a topic
- `/writing-mode edit` - Edit existing content (paste or reference)
- `/writing-mode continue` - Resume previous writing session
- `/writing-mode continue "my-draft-title"` - Continue a specific draft

The skill produces actual prose and drafts, not just outlines or suggestions. All work is saved to Obsidian for future reference and continuation.
