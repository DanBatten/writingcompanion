---
name: "code-project-analyzer"
description: "Traverses and understands code repositories to extract key concepts, architectural decisions, and innovations for writing about technical projects."
version: "0.1.0"
---

# Code Project Analyzer

Traverses and understands code repositories to extract key concepts, architectural decisions, and innovations for writing about technical projects.

## Purpose

Enable articulate writing about active code projects by understanding their technical depth and innovation. This skill bridges the gap between code and prose, extracting the narrative from implementation.

## Instructions

When the user activates code project analysis, follow these principles:

### Session Initialization

1. **Identify the repository**: Get the path (local) or owner/repo (GitHub)
2. **Understand the writing context**:
   - What kind of piece is this for? (blog post, documentation, case study, etc.)
   - Who is the audience? (developers, managers, general tech audience)
   - What aspects should be emphasized?
3. **Clarify focus areas**:
   - Overall architecture?
   - Specific technical innovations?
   - Development journey and decisions?
   - Problem/solution narrative?

### Analysis Process

#### Phase 1: Repository Overview

Get the big picture:

1. **Structure scan**: Understand directory organization
2. **Tech stack identification**: Languages, frameworks, dependencies
3. **Entry points**: Main files, configurations, documentation
4. **Recent activity**: Commit history to understand momentum

Using Multi-Repo MCP:
- `analyze_local_repo` or `analyze_github_repo`
- `extract_concepts` for initial pattern identification

#### Phase 2: Deep Dive

Based on focus areas, examine:

**Architecture Analysis**
- How is the code organized?
- What are the main modules/components?
- How do they interact?
- What patterns are employed? (MVC, microservices, event-driven, etc.)

**Innovation Points**
- What problems does this solve uniquely?
- What technical decisions are non-obvious?
- Where does it differ from common approaches?

**Code Quality Signals**
- Testing approach
- Documentation style
- Error handling patterns
- Configuration management

**Evolution Story**
- What does the commit history reveal?
- How has the architecture evolved?
- What were the pivotal changes?

Using Multi-Repo MCP:
- `read_repo_file` for specific file examination
- `search_repo` for pattern discovery
- `get_recent_commits` for history

#### Phase 3: Narrative Extraction

Transform technical findings into writing material:

**The Problem-Solution Arc**
- What problem prompted this project?
- What was the approach to solving it?
- What challenges arose?
- What's the current state?

**Technical Highlights**
- Key architectural decisions and their rationale
- Clever solutions worth explaining
- Trade-offs made and why

**Teachable Moments**
- What would help readers understand the approach?
- What patterns could be applied elsewhere?
- What lessons does this project offer?

### Output Formats

**Executive Summary**
```
# Project: [Name]

## What It Does
[One paragraph explanation]

## Key Technical Decisions
1. [Decision]: [Rationale]
2. ...

## Notable Patterns
- [Pattern and its application]

## Writing Angles
- [Potential article focus 1]
- [Potential article focus 2]
```

**Architecture Overview**
```
# Architecture Analysis: [Project]

## High-Level Structure
[Description with ASCII diagram if helpful]

## Component Breakdown
### [Component A]
- Purpose: ...
- Key files: ...
- Interactions: ...

## Data Flow
[How data moves through the system]

## Design Patterns Used
- [Pattern]: [Where and why]
```

**Innovation Report**
```
# Technical Innovations: [Project]

## Problem Context
[What problem space this exists in]

## Novel Approaches
1. [Innovation]: [Explanation]
   - Traditional approach: ...
   - This project's approach: ...
   - Why it matters: ...

## Implications
[What this enables or demonstrates]
```

**Writing Brief**
```
# Writing Brief: [Project]

## Core Narrative
[The story this project tells]

## Key Points to Cover
1. ...
2. ...

## Technical Details to Explain
- [Concept]: [Layperson explanation]

## Code Examples to Include
- [File:lines] - demonstrates [concept]

## Quotes from Code/Commits
- [Notable comment or commit message]
```

### Audience Calibration

Adjust analysis based on target audience:

**Technical Developers**
- Deep into implementation details
- Code examples with context
- Architectural diagrams
- Performance considerations

**Technical Managers**
- Focus on decisions and trade-offs
- Team/process implications
- Scalability and maintenance aspects
- Risk and reliability factors

**General Tech Audience**
- Emphasize problems solved
- Analogies for complex concepts
- Impact and implications
- Accessible explanations

### Tools to Use

**Primary: Multi-Repo MCP**
- `analyze_local_repo`: Local repository structure
- `analyze_github_repo`: GitHub repository metadata
- `read_repo_file`: Examine specific files
- `search_repo`: Find patterns and implementations
- `get_recent_commits`: Understand evolution
- `extract_concepts`: Surface key ideas
- `compare_repos`: Contrast with similar projects

**Supporting: Other MCPs**
- Content Capture: Find related articles about technologies used
- Obsidian: Access notes about the project
- Notion: Find project documentation

### Integration with Other Skills

**To /research-mode**
- Request deeper research on technologies discovered
- Explore broader context for innovations found

**To /writing-mode**
- Pass analysis results as writing input
- Provide code examples and technical details

**To /concept-web-builder**
- Map technical concepts to broader ideas
- Find connections to other domains

### What NOT to Do

- Don't just list files and directories; find the story
- Don't assume the reader knows the technology; calibrate
- Don't ignore the human decisions behind technical choices
- Don't miss the forest for the trees; synthesize
- Don't produce dry technical documentation; create narrative material

### Special Capabilities

**Diff Analysis**
When asked about changes:
- Compare branches or commits
- Explain what changed and why
- Identify breaking changes or migrations

**Dependency Deep Dive**
When relevant:
- Analyze key dependencies
- Explain why they were chosen
- Note interesting patterns in how they're used

**Documentation Quality**
Assess and report on:
- README completeness
- Code comment quality
- API documentation
- Setup instructions

## Usage

Activate with: `/code-project-analyzer`

Example invocations:
- `/code-project-analyzer /path/to/repo` - Analyze local repository
- `/code-project-analyzer owner/repo` - Analyze GitHub repository
- `/code-project-analyzer /path/to/repo architecture` - Focus on architecture
- `/code-project-analyzer owner/repo for-blog-post` - Calibrate for blog writing

The skill produces analysis material ready for transformation into writing, not just technical reports.
