# Motion Design

## Duration: The 100/300/500 Rule

Timing matters more than easing. These durations feel right for most UI:

| Duration      | Use Case            | Examples                           |
| ------------- | ------------------- | ---------------------------------- |
| **100-150ms** | Instant feedback    | Button press, toggle, color change |
| **200-300ms** | State changes       | Menu open, tooltip, hover states   |
| **300-500ms** | Layout changes      | Accordion, modal, drawer           |
| **500-800ms** | Entrance animations | Page load, hero reveals            |

**Exit animations are faster than entrances.** Use approximately 75% of enter duration.

## Easing: Pick the Right Curve

**Do not use ease.** It is a compromise that is rarely optimal. Instead:

| Curve           | Use For                        | CSS                            |
| --------------- | ------------------------------ | ------------------------------ |
| **ease-out**    | Elements entering              | cubic-bezier(0.16, 1, 0.3, 1)  |
| **ease-in**     | Elements leaving               | cubic-bezier(0.7, 0, 0.84, 0)  |
| **ease-in-out** | State toggles (there and back) | cubic-bezier(0.65, 0, 0.35, 1) |

**For micro-interactions, use exponential curves.** They feel natural because they mimic real physics (friction, deceleration):

```css
/* Quart out - smooth, refined (recommended default) */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

/* Quint out - slightly more dramatic */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);

/* Expo out - snappy, confident */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

**Avoid bounce and elastic curves.** They were trendy in 2015 but now feel tacky and amateurish. Real objects do not bounce when they stop. They decelerate smoothly. Overshoot effects draw attention to the animation itself rather than the content.

## The Only Two Properties You Should Animate

**transform** and **opacity** only. Everything else causes layout recalculations. For height animations (accordions), use grid-template-rows: 0fr to 1fr instead of animating height directly.

## Staggered Animations

Use CSS custom properties for cleaner stagger: animation-delay: calc(var(--i, 0) times 50ms) with style="--i: 0" on each item. **Cap total stagger time.** 10 items at 50ms equals 500ms total. For many items, reduce per-item delay or cap staggered count.

## Reduced Motion

This is not optional. Vestibular disorders affect approximately 35% of adults over 40.

```css
/* Define animations normally */
.card {
  animation: slide-up 500ms ease-out;
}

/* Provide alternative for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card {
    animation: fade-in 200ms ease-out; /* Crossfade instead of motion */
  }
}

/* Or disable entirely */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**What to preserve**: Functional animations like progress bars, loading spinners (slowed down), and focus indicators should still work. Just without spatial movement.

## Perceived Performance

**Nobody cares how fast your site is. Just how fast it feels.** Perception can be as effective as actual performance.

**The 80ms threshold**: Our brains buffer sensory input for approximately 80ms to synchronize perception. Anything under 80ms feels instant and simultaneous. This is your target for micro-interactions.

**Active vs passive time**: Passive waiting (staring at a spinner) feels longer than active engagement. Strategies to shift the balance:

- **Preemptive start**: Begin transitions immediately while loading (iOS app zoom, skeleton UI). Users perceive work happening.
- **Early completion**: Show content progressively. Do not wait for everything. Video buffering, progressive images, streaming HTML.
- **Optimistic UI**: Update the interface immediately, handle failures gracefully. Instagram likes work offline. The UI updates instantly, syncs later. Use for low-stakes actions. Avoid for payments or destructive operations.

**Easing affects perceived duration**: Ease-in (accelerating toward completion) makes tasks feel shorter because the peak-end effect weights final moments heavily. Ease-out feels satisfying for entrances, but ease-in toward a task end compresses perceived time.

**Caution**: Too-fast responses can decrease perceived value. Users may distrust instant results for complex operations (search, analysis). Sometimes a brief delay signals "real work" is happening.

## Performance

Do not use will-change preemptively. Only when animation is imminent (hover, .animating). For scroll-triggered animations, use Intersection Observer instead of scroll events. Unobserve after animating once. Create motion tokens for consistency (durations, easings, common transitions).

---

**Avoid**: Animating everything (animation fatigue is real). Using more than 500ms for UI feedback. Ignoring prefers-reduced-motion. Using animation to hide slow loading.
