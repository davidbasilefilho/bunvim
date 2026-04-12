# Heuristics Scoring Guide

Score each of Nielsen 10 Usability Heuristics on a 0-4 scale. Be honest. A 4 means genuinely excellent, not "good enough."

## Nielsen 10 Heuristics

### 1. Visibility of System Status

Keep users informed about what is happening through timely, appropriate feedback.

**Check for**:

- Loading indicators during async operations
- Confirmation of user actions (save, submit, delete)
- Progress indicators for multi-step processes
- Current location in navigation (breadcrumbs, active states)
- Form validation feedback (inline, not just on submit)

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | No feedback. User is guessing what happened. |
| 1 | Rare feedback. Most actions produce no visible response. |
| 2 | Partial. Some states communicated, major gaps remain. |
| 3 | Good. Most operations give clear feedback, minor gaps. |
| 4 | Excellent. Every action confirms, progress is always visible. |

### 2. Match Between System and Real World

Speak the user language. Follow real-world conventions. Information appears in natural, logical order.

**Check for**:

- Familiar terminology (no unexplained jargon)
- Logical information order matching user expectations
- Recognizable icons and metaphors
- Domain-appropriate language for the target audience
- Natural reading flow (left-to-right, top-to-bottom priority)

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Pure tech jargon, alien to users. |
| 1 | Mostly confusing. Requires domain expertise to navigate. |
| 2 | Mixed. Some plain language, some jargon leaks through. |
| 3 | Mostly natural. Occasional term needs context. |
| 4 | Speaks the user language fluently throughout. |

### 3. User Control and Freedom

Users need a clear "emergency exit" from unwanted states without extended dialogue.

**Check for**:

- Undo and redo functionality
- Cancel buttons on forms and modals
- Clear navigation back to safety (home, previous)
- Easy way to clear filters, search, selections
- Escape from long or multi-step processes

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Users get trapped. No way out without refreshing. |
| 1 | Difficult exits. Must find obscure paths to escape. |
| 2 | Some exits. Main flows have escape, edge cases do not. |
| 3 | Good control. Users can exit and undo most actions. |
| 4 | Full control. Undo, cancel, back, and escape everywhere. |

### 4. Consistency and Standards

Users should not wonder whether different words, situations, or actions mean the same thing.

**Check for**:

- Consistent terminology throughout the interface
- Same actions produce same results everywhere
- Platform conventions followed (standard UI patterns)
- Visual consistency (colors, typography, spacing, components)
- Consistent interaction patterns (same gesture equals same behavior)

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Inconsistent everywhere. Feels like different products stitched together. |
| 1 | Many inconsistencies. Similar things look or behave differently. |
| 2 | Partially consistent. Main flows match, details diverge. |
| 3 | Mostly consistent. Occasional deviation, nothing confusing. |
| 4 | Fully consistent. Cohesive system, predictable behavior. |

### 5. Error Prevention

Better than good error messages is a design that prevents problems in the first place.

**Check for**:

- Confirmation before destructive actions (delete, overwrite)
- Constraints preventing invalid input (date pickers, dropdowns)
- Smart defaults that reduce errors
- Clear labels that prevent misunderstanding
- Autosave and draft recovery

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Errors easy to make. No guardrails anywhere. |
| 1 | Few safeguards. Some inputs validated, most are not. |
| 2 | Partial prevention. Common errors caught, edge cases slip. |
| 3 | Good prevention. Most error paths blocked proactively. |
| 4 | Excellent. Errors nearly impossible through smart constraints. |

### 6. Recognition Rather Than Recall

Minimize memory load. Make objects, actions, and options visible or easily retrievable.

**Check for**:

- Visible options (not buried in hidden menus)
- Contextual help when needed (tooltips, inline hints)
- Recent items and history
- Autocomplete and suggestions
- Labels on icons (not icon-only navigation)

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Heavy memorization. Users must remember paths and commands. |
| 1 | Mostly recall. Many hidden features, few visible cues. |
| 2 | Some aids. Main actions visible, secondary features hidden. |
| 3 | Good recognition. Most things discoverable, few memory demands. |
| 4 | Everything discoverable. Users never need to memorize. |

### 7. Flexibility and Efficiency of Use

Accelerators. Invisible to novices. Speed up expert interaction.

**Check for**:

- Keyboard shortcuts for common actions
- Customizable interface elements
- Recent items and favorites
- Bulk or batch actions
- Power user features that do not complicate the basics

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | One rigid path. No shortcuts or alternatives. |
| 1 | Limited flexibility. Few alternatives to the main path. |
| 2 | Some shortcuts. Basic keyboard support, limited bulk actions. |
| 3 | Good accelerators. Keyboard nav, some customization. |
| 4 | Highly flexible. Multiple paths, power features, customizable. |

### 8. Aesthetic and Minimalist Design

Interfaces should not contain irrelevant or rarely needed information. Every element should serve a purpose.

**Check for**:

- Only necessary information visible at each step
- Clear visual hierarchy directing attention
- Purposeful use of color and emphasis
- No decorative clutter competing for attention
- Focused, uncluttered layouts

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Overwhelming. Everything competes for attention equally. |
| 1 | Cluttered. Too much noise, hard to find what matters. |
| 2 | Some clutter. Main content clear, periphery noisy. |
| 3 | Mostly clean. Focused design, minor visual noise. |
| 4 | Perfectly minimal. Every element earns its pixel. |

### 9. Help Users Recognize, Diagnose, and Recover from Errors

Error messages should use plain language, precisely indicate the problem, and constructively suggest a solution.

**Check for**:

- Plain language error messages (no error codes for users)
- Specific problem identification ("Email is missing @" not "Invalid input")
- Actionable recovery suggestions
- Errors displayed near the source of the problem
- Non-blocking error handling (do not wipe the form)

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | Cryptic errors. Codes, jargon, or no message at all. |
| 1 | Vague errors. "Something went wrong" with no guidance. |
| 2 | Clear but unhelpful. Names the problem but not the fix. |
| 3 | Clear with suggestions. Identifies problem and offers next steps. |
| 4 | Perfect recovery. Pinpoints issue, suggests fix, preserves user work. |

### 10. Help and Documentation

Even if the system is usable without docs, help should be easy to find, task-focused, and concise.

**Check for**:

- Searchable help or documentation
- Contextual help (tooltips, inline hints, guided tours)
- Task-focused organization (not feature-organized)
- Concise, scannable content
- Easy access without leaving current context

**Scoring**:
| Score | Criteria |
|-------|----------|
| 0 | No help available anywhere. |
| 1 | Help exists but hard to find or irrelevant. |
| 2 | Basic help. FAQ or docs exist, not contextual. |
| 3 | Good documentation. Searchable, mostly task-focused. |
| 4 | Excellent contextual help. Right info at the right moment. |

---

## Score Summary

**Total possible**: 40 points (10 heuristics times 4 max)

| Score Range | Rating     | What It Means                                           |
| ----------- | ---------- | ------------------------------------------------------- |
| 36-40       | Excellent  | Minor polish only. Ship it.                             |
| 28-35       | Good       | Address weak areas, solid foundation.                   |
| 20-27       | Acceptable | Significant improvements needed before users are happy. |
| 12-19       | Poor       | Major UX overhaul required. Core experience broken.     |
| 0-11        | Critical   | Redesign needed. Unusable in current state.             |

---

## Issue Severity (P0-P3)

Tag each individual issue found during scoring with a priority level:

| Priority | Name     | Description                                | Action                                  |
| -------- | -------- | ------------------------------------------ | --------------------------------------- |
| **P0**   | Blocking | Prevents task completion entirely          | Fix immediately. This is a showstopper. |
| **P1**   | Major    | Causes significant difficulty or confusion | Fix before release.                     |
| **P2**   | Minor    | Annoyance, but workaround exists           | Fix in next pass.                       |
| **P3**   | Polish   | Nice-to-fix, no real user impact           | Fix if time permits.                    |

**Tip**: If you are unsure between two levels, ask: "Would a user contact support about this?" If yes, it is at least P1.
