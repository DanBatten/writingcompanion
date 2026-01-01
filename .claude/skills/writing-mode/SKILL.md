---
name: "writing-mode"
description: "Structures writing sessions with clear goals, outlines, and progressive development. Integrates research findings into coherent narratives."
version: "0.1.0"
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
   - Was there a preceding research session? If so, use those insights
   - What's the target audience?
   - What's the desired length/depth?
   - Is there an existing draft to work from?

3. **Establish the core message**: Help articulate the central idea or argument before writing begins

### Writing Process

#### Phase 1: Structure

Before writing prose:

1. **Develop a working thesis**: One sentence capturing the main point
2. **Create an outline**:
   - Major sections with clear purposes
   - Key points for each section
   - Logical flow between sections
3. **Identify supporting material**:
   - Pull relevant quotes/data from research
   - Note which sources support which points
   - Plan where examples or case studies fit

#### Phase 2: Drafting

Write section by section:

1. **Start with the section that feels most ready** (not necessarily the intro)
2. **Draft in focused blocks**:
   - Write one section at a time
   - Don't perfect; get ideas down
   - Mark places that need more research with [TODO]
3. **Maintain momentum**:
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

### Tools to Use

**Notion MCP** (for saving work)
- `create_page`: Save drafts to Notion
- `append_to_page`: Add to existing drafts
- `search_pages`: Find related notes

**Content Capture MCP** (for sourcing)
- `search_knowledge`: Find supporting material
- `get_content_item`: Retrieve full source text

**Obsidian Vault MCP**
- `read_note`: Access relevant personal notes
- `search_notes`: Find supporting ideas

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
1. Asks clarifying questions about audience and angle
2. Proposes a working thesis
3. Suggests an outline
4. Begins drafting once structure is approved
```

**From Research**
```
User: /writing-mode (after /research-mode)
Claude:
1. Summarizes key research findings
2. Proposes how to structure them into a piece
3. Identifies the strongest narrative thread
4. Creates outline incorporating research
```

**Editing Existing Work**
```
User: /writing-mode edit [paste draft]
Claude:
1. Reads and understands the draft
2. Identifies strengths and opportunities
3. Proposes specific improvements
4. Helps implement revisions
```

### Output Options

When finishing a writing session:

1. **Save to Notion**: Create a page with the draft
2. **Export as file**: Write to a local markdown file
3. **Keep in chat**: Just return the text for user to copy

Ask the user their preference before finalizing.

### What NOT to Do

- Don't write everything at once without checking direction
- Don't ignore the user's voice in favor of "better" prose
- Don't pad content to hit arbitrary length
- Don't refuse to start until everything is perfectly planned
- Don't lose research insights by not referencing them

### Integration with Other Skills

- **From /research-mode**: Accept research context and transform into writing
- **To /concept-web-builder**: Request additional connections if needed during writing
- **To /code-project-analyzer**: Get technical details for technical writing

## Usage

Activate with: `/writing-mode`

Example invocations:
- `/writing-mode` - Start a new writing session
- `/writing-mode "article about distributed systems"` - Start with a topic
- `/writing-mode edit` - Edit existing content (paste or reference)
- `/writing-mode continue` - Resume previous writing session

The skill produces actual prose and drafts, not just outlines or suggestions.
