---
name: critique
description: "Evaluate design from a UX perspective, assessing visual hierarchy, information architecture, emotional resonance, cognitive load, and overall quality with quantitative scoring, persona-based testing, and actionable feedback. Use when the user asks to review, critique, evaluate, or give feedback on a design or component."
argument-hint: "[area (feature, page, component...)]"
user-invocable: true
---

## MANDATORY PREPARATION

Invoke {{command_prefix}}frontend-design. It contains design principles, anti-patterns, and the Context Gathering Protocol. Follow the protocol before proceeding. If no design context exists yet, you MUST run {{command_prefix}}teach-impeccable first. Additionally gather: what the interface is trying to accomplish.

---

Conduct a holistic design critique, evaluating whether the interface actually works: not just technically, but as a designed experience. Think like a design director giving feedback.

## Phase 1: Design Critique

Evaluate the interface across these dimensions.

### 1. AI Slop Detection (CRITICAL)

**This is the most important check.** Does this look like every other AI-generated interface from 2024-2025?

Review the design against ALL the DO NOT guidelines in the frontend-design skill. They are the fingerprints of AI-generated work. Check for the AI color palette, gradient text, dark mode with glowing accents, glassmorphism, hero metric layouts, identical card grids, generic fonts, and all other tells.

**The test**: If you showed this to someone and said "AI made this," would they believe you immediately? If yes, that is the problem.

### 2. Visual Hierarchy

- Does the eye flow to the most important element first?
- Is there a clear primary action? Can you spot it in 2 seconds?
- Do size, color, and position communicate importance correctly?
- Is there visual competition between elements that should have different weights?

### 3. Information Architecture and Cognitive Load

> _Consult [cognitive-load](reference/cognitive-load.md) for the working memory rule and 8-item checklist_

- Is the structure intuitive? Would a new user understand the organization?
- Is related content grouped logically?
- Are there too many choices at once? Count visible options at each decision point. If more than 4, flag it.
- Is the navigation clear and predictable?
- **Progressive disclosure**: Is complexity revealed only when needed, or dumped on the user upfront?
- **Run the 8-item cognitive load checklist** from the reference. Report failure count: 0-1 equals low (good), 2-3 equals moderate, 4+ equals critical.

### 4. Emotional Journey

- What emotion does this interface evoke? Is that intentional?
- Does it match the brand personality?
- Does it feel trustworthy, approachable, premium, playful: whatever it should feel?
- Would the target user feel "this is for me"?
- **Peak-end rule**: Is the most intense moment positive? Does the experience end well (confirmation, celebration, clear next step)?
- **Emotional valleys**: Check for onboarding frustration, error cliffs, feature discovery gaps, or anxiety spikes at high-stakes moments (payment, delete, commit)
- **Interventions at negative moments**: Are there design interventions where users are likely to feel frustrated or anxious? (progress indicators, reassurance copy, undo options, social proof)

### 5. Discoverability and Affordance

- Are interactive elements obviously interactive?
- Would a user know what to do without instructions?
- Are hover and focus states providing useful feedback?
- Are there hidden features that should be more visible?

### 6. Composition and Balance

- Does the layout feel balanced or uncomfortably weighted?
- Is whitespace used intentionally or just leftover?
- Is there visual rhythm in spacing and repetition?
- Does asymmetry feel designed or accidental?

### 7. Typography as Communication

- Does the type hierarchy clearly signal what to read first, second, third?
- Is body text comfortable to read? (line length, spacing, size)
- Do font choices reinforce the brand or tone?
- Is there enough contrast between heading levels?

### 8. Color with Purpose

- Is color used to communicate, not just decorate?
- Does the palette feel cohesive?
- Are accent colors drawing attention to the right things?
- Does it work for colorblind users? (not just technically: does meaning still come through?)

### 9. States and Edge Cases

- Empty states: Do they guide users toward action, or just say "nothing here"?
- Loading states: Do they reduce perceived wait time?
- Error states: Are they helpful and non-blaming?
- Success states: Do they confirm and guide next steps?

### 10. Microcopy and Voice

- Is the writing clear and concise?
- Does it sound like a human (the right human for this brand)?
- Are labels and buttons unambiguous?
- Does error copy help users fix the problem?

## Phase 2: Present Findings

Structure your feedback as a design director would.

### Design Health Score

> _Consult [heuristics-scoring](reference/heuristics-scoring.md)_

Score each of Nielsen 10 heuristics 0-4. Present as a table:

| #         | Heuristic                       | Score     | Key Issue                          |
| --------- | ------------------------------- | --------- | ---------------------------------- |
| 1         | Visibility of System Status     | ?         | [specific finding or "—" if solid] |
| 2         | Match System and Real World     | ?         |                                    |
| 3         | User Control and Freedom        | ?         |                                    |
| 4         | Consistency and Standards       | ?         |                                    |
| 5         | Error Prevention                | ?         |                                    |
| 6         | Recognition Rather Than Recall  | ?         |                                    |
| 7         | Flexibility and Efficiency      | ?         |                                    |
| 8         | Aesthetic and Minimalist Design | ?         |                                    |
| 9         | Error Recovery                  | ?         |                                    |
| 10        | Help and Documentation          | ?         |                                    |
| **Total** |                                 | **??/40** | **[Rating band]**                  |

Be honest with scores. A 4 means genuinely excellent. Most real interfaces score 20-32.

### Anti-Patterns Verdict

**Start here.** Pass or fail: Does this look AI-generated? List specific tells from the skill Anti-Patterns section. Be brutally honest.

### Overall Impression

A brief gut reaction: what works, what does not, and the single biggest opportunity.

### What is Working

Highlight 2-3 things done well. Be specific about why they work.

### Priority Issues

The 3-5 most impactful design problems, ordered by importance.

For each issue, tag with P0-P3 severity (consult [heuristics-scoring](reference/heuristics-scoring.md) for severity definitions):

- **[P?] What**: Name the problem clearly
- **Why it matters**: How this hurts users or undermines goals
- **Fix**: What to do about it (be concrete)
- **Suggested command**: Which command could address this (from: {{available_commands}})

### Persona Red Flags

> _Consult [personas](reference/personas.md)_

Auto-select 2-3 personas most relevant to this interface type (use the selection table in the reference). If {{config_file}} contains a Design Context section from teach-impeccable, also generate 1-2 project-specific personas from the audience or brand info.

For each selected persona, walk through the primary user action and list specific red flags found:

**Alex (Power User)**: No keyboard shortcuts detected. Form requires 8 clicks for primary action. Forced modal onboarding. High abandonment risk.

**Jordan (First-Timer)**: Icon-only nav in sidebar. Technical jargon in error messages ("404 Not Found"). No visible help. Will abandon at step 2.

Be specific. Name the exact elements and interactions that fail each persona. Do not write generic persona descriptions. Write what broke for them.

### Minor Observations

Quick notes on smaller issues worth addressing.

**Remember**:

- Be direct. Vague feedback wastes everyone time.
- Be specific. "the submit button" not "some elements"
- Say what is wrong AND why it matters to users
- Give concrete suggestions, not just "consider exploring..."
- Prioritize ruthlessly. If everything is important, nothing is.
- Do not soften criticism. Developers need honest feedback to ship great design.

## Phase 3: Ask the User

**After presenting findings**, use targeted questions based on what was actually found. {{ask_instruction}} These answers will shape the action plan.

Ask questions along these lines (adapt to the specific findings: do NOT ask generic questions):

1. **Priority direction**: Based on the issues found, ask which category matters most to the user right now. For example: "I found problems with visual hierarchy, color usage, and information overload. Which area should we tackle first?" Offer the top 2-3 issue categories as options.

2. **Design intent**: If the critique found a tonal mismatch, ask whether it was intentional. For example: "The interface feels clinical and corporate. Is that the intended tone, or should it feel warmer, bolder, more playful?" Offer 2-3 tonal directions as options based on what would fix the issues found.

3. **Scope**: Ask how much the user wants to take on. For example: "I found N issues. Want to address everything, or focus on the top 3?" Offer scope options like "Top 3 only", "All issues", "Critical issues only".

4. **Constraints** (optional: only ask if relevant): If the findings touch many areas, ask if anything is off-limits. For example: "Should any sections stay as-is?" This prevents the plan from touching things the user considers done.

**Rules for questions**:

- Every question must reference specific findings from Phase 2. Never ask generic "who is your audience?" questions
- Keep it to 2-4 questions maximum. Respect the user time.
- Offer concrete options, not open-ended prompts.
- If findings are straightforward (e.g., only 1-2 clear issues), skip questions and go directly to Phase 4

## Phase 4: Recommended Actions

**After receiving the user answers**, present a prioritized action summary reflecting the user priorities and scope from Phase 3.

### Action Summary

List recommended commands in priority order, based on the user answers:

1. **`{{command_prefix}}command-name`**: Brief description of what to fix (specific context from critique findings)
2. **`{{command_prefix}}command-name`**: Brief description (specific context)
   ...

**Rules for recommendations**:

- Only recommend commands from: {{available_commands}}
- Order by the user stated priorities first, then by impact
- Each item description should carry enough context that the command knows what to focus on
- Map each Priority Issue to the appropriate command
- Skip commands that would address zero issues
- If the user chose a limited scope, only include items within that scope
- If the user marked areas as off-limits, exclude commands that would touch those areas
- End with {{command_prefix}}polish as the final step if any fixes were recommended

After presenting the summary, tell the user:

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run {{command_prefix}}critique after fixes to see your score improve.
