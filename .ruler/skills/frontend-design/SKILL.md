---
name: frontend-design
description: "Create distinctive, production-grade frontend interfaces with high design quality. Generates creative, polished code that avoids generic AI aesthetics. Use when the user asks to build web components, pages, artifacts, posters, or applications, or when any design skill requires project context."
license: Apache 2.0. Based on Anthropic's frontend-design skill. See NOTICE.md for attribution.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

## Context Gathering Protocol

Design skills produce generic output without project context. You MUST have confirmed design context before doing any design work.

**Required context** — every design skill needs at minimum:

- **Target audience**: Who uses this product and in what context?
- **Use cases**: What jobs are they trying to get done?
- **Brand personality or tone**: How should the interface feel?

Individual skills may require additional context. Check the skill preparation section for specifics.

**CRITICAL**: You cannot infer this context by reading the codebase. Code tells you what was built, not who it is for or what it should feel like. Only the creator can provide this context.

**Gathering order:**

1. **Check current instructions (instant)**: If your loaded instructions already contains a Design Context section, proceed immediately.
2. **Check .impeccable.md (fast)**: If not in instructions, read `.impeccable.md` from the project root. If it exists and contains the required context, proceed.
3. **Run teach-impeccable (REQUIRED)**: If neither source has context, you MUST run {{command_prefix}}teach-impeccable NOW before doing anything else. Do NOT skip this step. Do NOT attempt to infer context from the codebase instead.

---

## Design Direction

Commit to a BOLD aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic or natural, luxury or refined, playful or toy-like, editorial or magazine, brutalist or raw, art deco or geometric, soft or pastel, industrial or utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What is the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work. The key is intentionality, not intensity.

Then implement working code that is:

- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point of view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

### Typography

> _Consult [typography reference](reference/typography.md) for scales, pairing, and loading strategies._

Choose fonts that are beautiful, unique, and interesting. Pair a distinctive display font with a refined body font.

**DO**: Use a modular type scale with fluid sizing (clamp)
**DO**: Vary font weights and sizes to create clear visual hierarchy
**DON'T**: Use overused fonts: Inter, Roboto, Arial, Open Sans, system defaults
**DON'T**: Use monospace typography as lazy shorthand for "technical or developer" vibes
**DON'T**: Put large icons with rounded corners above every heading. They rarely add value and make sites look templated

### Color and Theme

> _Consult [color reference](reference/color-and-contrast.md) for OKLCH, palettes, and dark mode._

Commit to a cohesive palette. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.

**DO**: Use modern CSS color functions (oklch, color-mix, light-dark) for perceptually uniform, maintainable palettes
**DO**: Tint your neutrals toward your brand hue. Even a subtle hint creates subconscious cohesion
**DON'T**: Use gray text on colored backgrounds. It looks washed out. Use a shade of the background color instead.
**DON'T**: Use pure black (#000) or pure white (#fff). Always tint. Pure black or white never appears in nature.
**DON'T**: Use the AI color palette: cyan on dark, purple to blue gradients, neon accents on dark backgrounds
**DON'T**: Use gradient text for "impact". Especially on metrics or headings. It is decorative rather than meaningful.
**DON'T**: Default to dark mode with glowing accents. It looks "cool" without requiring actual design decisions.

### Layout and Space

> _Consult [spatial reference](reference/spatial-design.md) for grids, rhythm, and container queries._

Create visual rhythm through varied spacing. Not the same padding everywhere. Embrace asymmetry and unexpected compositions. Break the grid intentionally for emphasis.

**DO**: Create visual rhythm through varied spacing: tight groupings, generous separations
**DO**: Use fluid spacing with clamp() that breathes on larger screens
**DO**: Use asymmetry and unexpected compositions. Break the grid intentionally for emphasis.
**DON'T**: Wrap everything in cards. Not everything needs a container.
**DON'T**: Nest cards inside cards. Visual noise. Flatten the hierarchy.
**DON'T**: Use identical card grids. Same-sized cards with icon, heading, text, repeated endlessly.
**DON'T**: Use the hero metric layout template. Big number, small label, supporting stats, gradient accent.
**DON'T**: Center everything. Left-aligned text with asymmetric layouts feels more designed.
**DON'T**: Use the same spacing everywhere. Without rhythm, layouts feel monotonous.

### Visual Details

**DO**: Use intentional, purposeful decorative elements that reinforce brand.
**DON'T**: Use glassmorphism everywhere. Blur effects, glass cards, glow borders used decoratively rather than purposefully.
**DON'T**: Use rounded elements with thick colored border on one side. A lazy accent that almost never looks intentional.
**DON'T**: Use sparklines as decoration. Tiny charts that look sophisticated but convey nothing meaningful.
**DON'T**: Use rounded rectangles with generic drop shadows. Safe, forgettable, could be any AI output.
**DON'T**: Use modals unless there is truly no better alternative. Modals are lazy.

### Motion

> _Consult [motion reference](reference/motion-design.md) for timing, easing, and reduced motion._

Focus on high-impact moments. One well-orchestrated page load with staggered reveals creates more delight than scattered micro-interactions.

**DO**: Use motion to convey state changes: entrances, exits, feedback
**DO**: Use exponential easing (ease-out-quart, quint, or expo) for natural deceleration
**DO**: For height animations, use grid-template-rows transitions instead of animating height directly.
**DON'T**: Animate layout properties (width, height, padding, margin). Use transform and opacity only.
**DON'T**: Use bounce or elastic easing. They feel dated and tacky. Real objects decelerate smoothly.

### Interaction

> _Consult [interaction reference](reference/interaction-design.md) for forms, focus, and loading patterns._

Make interactions feel fast. Use optimistic UI: update immediately, sync later.

**DO**: Use progressive disclosure. Start simple, reveal sophistication through interaction (basic options first, advanced behind expandable sections; hover states that reveal secondary actions).
**DO**: Design empty states that teach the interface, not just say "nothing here"
**DO**: Make every interactive surface feel intentional and responsive.
**DON'T**: Repeat the same information. Redundant headers, intros that restate the heading.
**DON'T**: Make every button primary. Use ghost buttons, text links, secondary styles. Hierarchy matters.

### Responsive

> _Consult [responsive reference](reference/responsive-design.md) for mobile-first, fluid design, and container queries._

**DO**: Use container queries (@container) for component-level responsiveness
**DO**: Adapt the interface for different contexts. Do not just shrink it.
**DON'T**: Hide critical functionality on mobile. Adapt the interface, do not amputate it.

### UX Writing

> _Consult [ux-writing reference](reference/ux-writing.md) for labels, errors, and empty states._

**DO**: Make every word earn its place.
**DON'T**: Repeat information users can already see.

---

## The AI Slop Test

**Critical quality check**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that is the problem.

A distinctive interface should make someone ask "how was this made?" not "which AI made this?"

Review the DO NOT guidelines above. They are the fingerprints of AI-generated work from 2024-2025.

---

## Implementation Principles

Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices across generations.

Remember: {{model}} is capable of extraordinary creative work. Do not hold back. Show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
