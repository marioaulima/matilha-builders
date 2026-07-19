# 001 — Wrap the app in MotionConfig so reduced-motion actually reaches JS-driven animation

- **Status**: TODO
- **Commit**: c9d0df2
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file (`apps/web/src/routes/+layout.svelte`)

## Problem

The app uses `@humanspeak/svelte-motion`'s `motion.*` components and `AnimatePresence`
97 times across every route (board, feed, profile, checkin, requests, header/nav,
sign-in/up forms). These animate via JavaScript (WAAPI), not CSS `transition`/
`animation` properties.

The app's only reduced-motion handling lives in `apps/web/src/app.css:292`:

```css
/* apps/web/src/app.css:292 — current */
@media (prefers-reduced-motion: reduce) {
	::view-transition-old(root),
	::view-transition-new(root) {
		animation-duration: 1ms;
	}

	*,
	*::before,
	*::after {
		transition-duration: 1ms !important;
		animation-duration: 1ms !important;
	}
}
```

This only forces the CSS `animation-duration`/`transition-duration` properties to
1ms. It has zero effect on `motion.*` components — their animations are driven by
the Web Animations API through the library's own JS engine, not by CSS
`transition`/`animation` at all, so this rule never touches them.

There is no `<MotionConfig>` anywhere in the codebase (confirmed: `grep -rn
"MotionConfig" apps/web/src` returns nothing). Every user with OS-level "reduce
motion" turned on still gets full-motion card entrances, drawer content
animations, AnimatePresence exits, spring bounces, etc. across the entire app.

## Target

`@humanspeak/svelte-motion` ships a `<MotionConfig>` component with a
`reducedMotion` prop (`'user' | 'always' | 'never'`, default `'never'`). Setting
it to `'user'` makes every descendant `motion.*`/`AnimatePresence` component
resolve the OS `prefers-reduced-motion` setting automatically and strip
transform-related animation targets (`x`, `y`, `scale`, `rotate`, translate)
while preserving `opacity`/color transitions and the `transition` timing config
itself — i.e. exactly the "fewer and gentler, not zero" behavior the AUDIT
catalog specifies for reduced motion.

Target code (root layout):

```svelte
<!-- apps/web/src/routes/+layout.svelte — target -->
<script lang="ts">
	import { AnimatePresence, MotionConfig, motion } from "@humanspeak/svelte-motion";
	// ...rest of existing imports unchanged
</script>

<MotionConfig reducedMotion="user">
	<QueryClientProvider client={queryClient}>
		<!-- ...entire existing template body, unchanged... -->
	</QueryClientProvider>
</MotionConfig>
```

No other file changes — this is a single wrapping component at the app root, and
its effect propagates to every `motion.*`/`AnimatePresence` usage in the tree via
Svelte context (confirmed via `MotionConfig.svelte`'s implementation, which calls
`createMotionConfig(...)` and every `motion.*` component reads that context).

## Repo conventions to follow

- The existing CSS-only reduced-motion block at `apps/web/src/app.css:292` stays
  untouched — it correctly handles the View Transitions API cross-fade and any
  plain-CSS `transition`/`animation` usage (e.g. `drawer-overlay.svelte`,
  `popover-content.svelte`, `select-content.svelte`, the `animate-collapsible-*`
  classes). This plan only closes the gap for the JS-driven half of the app's
  motion.
- `@humanspeak/svelte-motion` exports are already imported the same way
  everywhere in this repo, e.g. `apps/web/src/routes/+layout.svelte:2`:
  `import { motion } from "@humanspeak/svelte-motion";` — add `MotionConfig` to
  that same import statement, don't create a second import line.

## Steps

1. Open `apps/web/src/routes/+layout.svelte`. Change line 2 from:
   ```ts
   import { motion } from "@humanspeak/svelte-motion";
   ```
   to:
   ```ts
   import { AnimatePresence, MotionConfig, motion } from "@humanspeak/svelte-motion";
   ```
   (Check first whether `AnimatePresence` is already imported elsewhere in this
   file — if it is, just add `MotionConfig` to the existing import list instead
   of duplicating `AnimatePresence`.)

2. In the template, wrap the single root `<QueryClientProvider>` element (and
   everything inside it) with `<MotionConfig reducedMotion="user">` as the
   outermost element, so it sits above `QueryClientProvider` in the tree:
   ```svelte
   <MotionConfig reducedMotion="user">
   	<QueryClientProvider client={queryClient}>
   		<!-- existing children unchanged -->
   	</QueryClientProvider>
   </MotionConfig>
   ```
   Do not reorder or modify anything inside `QueryClientProvider` — this is a
   pure wrap, add one opening tag before it and one closing tag after it.

## Boundaries

- Do NOT touch any other file — no changes needed anywhere else since
  `MotionConfig`'s context propagates automatically to every existing
  `motion.*`/`AnimatePresence` usage.
- Do NOT change any individual component's `transition`/`initial`/`animate`
  props — this plan is purely the top-level wrap.
- Do NOT modify `app.css`'s existing reduced-motion block.
- Do NOT add a new npm dependency — `MotionConfig` is already exported by the
  installed `@humanspeak/svelte-motion` package (confirmed at
  `node_modules/@humanspeak/svelte-motion/dist/components/MotionConfig.svelte`).
- If `+layout.svelte`'s structure has changed since commit `c9d0df2` such that
  there isn't a single root element to wrap, STOP and report instead of
  improvising a different wrapping strategy.

## Verification

- **Mechanical**: `pnpm exec svelte-check --tsconfig ./tsconfig.json` from
  `apps/web` — expect 0 errors, 0 warnings (same as baseline at commit
  `c9d0df2`).
- **Feel check** (for a human, not required to run this session per explicit
  instruction to skip E2E/browser validation):
  - In Chrome DevTools → Rendering panel → "Emulate CSS media feature
    prefers-reduced-motion" → "reduce".
  - Navigate to `/board`: founder cards should still fade in (opacity) but
    without the `y: 6 → 0` slide.
  - Open a product's "Ver mais sobre" drawer and the profile edit drawer:
    content should still appear, without sliding transforms if any exist
    in-panel.
  - Toggle a Collapsible (Produtos/Check-ins on the profile page) — unaffected,
    since those are CSS `animate-collapsible-*`, already covered by the
    existing `app.css` rule.
  - Confirm normal (non-reduced) motion is completely unchanged with the OS
    setting off.
- **Done when**: `<MotionConfig reducedMotion="user">` wraps the app root in
  `+layout.svelte`, `svelte-check` is clean, and no other file was modified.
