# 005 — Animate sibling reflow when product cards enter/exit the grid

- **Status**: DONE
- **Commit**: 0894639
- **Severity**: HIGH
- **Category**: Physicality & origin / Missed opportunities
- **Estimated scope**: 2 files, 2-line change (grew to 3 after `review-animations` flagged the `layout:` transition sub-key was needed)

## Problem

`apps/web/src/lib/components/matilha/profile-products.svelte` renders the
product grid inside `AnimatePresence` with no `mode`, and
`apps/web/src/lib/components/matilha/profile-product-card.svelte`'s card
`motion.div` has no `layout` prop:

```svelte
<!-- apps/web/src/lib/components/matilha/profile-products.svelte:363-386 — current -->
{#if founder.products.length}
	<div
		class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3"
	>
		<AnimatePresence>
			{#each founder.products as product, index (product._key ?? product.id)}
				<ProfileProductCard
					{index}
					...
					{product}
				/>
			{/each}
		</AnimatePresence>
	</div>
{:else}
```

```svelte
<!-- apps/web/src/lib/components/matilha/profile-product-card.svelte:84-91 — current -->
<motion.div
	animate={{ opacity: 1, scale: 1, y: 0 }}
	class="flex flex-col gap-4 rounded-xl border border-border p-4"
	exit={{ opacity: 0, scale: 0.96 }}
	initial={{ opacity: 0, scale: 0.96, y: 8 }}
	key={itemKey}
	transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
>
```

Each card's own fade/scale entrance and exit is already correct (strong
ease-out, no `scale(0)`, staggered). But the CSS grid itself has no idea an
animation is happening: the moment a card is added to or removed from the
`{#each}` list, every *other* card in the grid snaps instantly to its new
row/column position — that's the "brusco" feeling. The individual card
animates smoothly while its neighbors teleport around it.

`@humanspeak/svelte-motion` mirrors framer-motion's API here and already
ships what's needed:
`node_modules/@humanspeak/svelte-motion/dist/types.d.ts:625-626` — `motion.*`
elements accept a `layout?: boolean | 'position' | 'size' | 'preserve-aspect'`
prop that enables FLIP position/size animation.
`node_modules/@humanspeak/svelte-motion/dist/components/AnimatePresence.svelte.d.ts:13`
— `AnimatePresence`'s `mode` prop accepts `'sync' | 'wait' | 'popLayout'`;
`popLayout` takes an exiting element out of document flow (so its neighbors
reflow immediately via their own `layout` animation) instead of waiting for
the exit animation to finish before the layout shift happens.

## Target

```svelte
<!-- apps/web/src/lib/components/matilha/profile-products.svelte — target -->
<AnimatePresence mode="popLayout">
	{#each founder.products as product, index (product._key ?? product.id)}
```

```svelte
<!-- apps/web/src/lib/components/matilha/profile-product-card.svelte — target -->
<motion.div
	animate={{ opacity: 1, scale: 1, y: 0 }}
	class="flex flex-col gap-4 rounded-xl border border-border p-4"
	exit={{ opacity: 0, scale: 0.96 }}
	initial={{ opacity: 0, scale: 0.96, y: 8 }}
	key={itemKey}
	layout
	transition={{
		delay: index * 0.04,
		duration: 0.2,
		ease: [0.23, 1, 0.32, 1],
		layout: { duration: 0.2, ease: [0.77, 0, 0.175, 1] },
	}}
>
```

No change to the existing `initial`/`animate`/`exit` values — those are
already correct per the audit (0.96 scale floor, 40ms stagger). The
`transition` object gains a `layout:` sub-key: without it, sibling reflow
inherits the entrance's `ease-out` curve and `index * 0.04` stagger delay,
both of which are meant for elements *arriving*, not for existing elements
*sliding to a new position*. Per this repo's own AUDIT.md category 2 ("Moving
/ morphing on screen → `ease-in-out`"), reflow gets the repo's
`--ease-in-out` token value (`cubic-bezier(0.77, 0, 0.175, 1)`) and no delay,
so all repositioning siblings move together instead of cascading with a
stale per-index delay.

## Repo conventions to follow

- `layout` and `AnimatePresence mode` are both plain props on the existing
  `motion.div`/`AnimatePresence` components already imported in both files
  (`import { AnimatePresence, motion } from "@humanspeak/svelte-motion";`) —
  no new imports, no new dependencies.
- Every other value in the card's `transition` object (delay expression,
  duration, ease curve) is already the repo's established convention — do
  not touch them.

## Steps

1. Open `apps/web/src/lib/components/matilha/profile-products.svelte`. Find
   `<AnimatePresence>` at line 367 (the one wrapping
   `{#each founder.products as product, index (product._key ?? product.id)}`
   — NOT the one at line 344 wrapping the add-product panel, leave that one
   untouched). Change it to `<AnimatePresence mode="popLayout">`.

2. Open `apps/web/src/lib/components/matilha/profile-product-card.svelte`.
   Find the card's `motion.div` opening tag at line 84-91. Add a bare
   `layout` prop (boolean shorthand, no value) anywhere among its existing
   props — alphabetical placement matches repo convention, so insert it
   between `key={itemKey}` and `transition={{ ... }}`. Then add a `layout:`
   sub-key inside the `transition` object with the repo's `--ease-in-out`
   token value and no delay, so reflow doesn't inherit the entrance's
   stagger/curve:
   `transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1], layout: { duration: 0.2, ease: [0.77, 0, 0.175, 1] } }}`.

## Boundaries

- Do NOT add `mode="popLayout"` to the `AnimatePresence` at
  `profile-products.svelte:344` (the add-product panel) — that one wraps a
  single conditional element, not a reflowing list, and changing its mode
  is a separate concern not covered by this plan.
- Do NOT add `layout` to any other `motion.*` element in either file (the
  add-product panel's `motion.div`, the `confirmingDelete`/`actions`
  cross-fade `motion.div`s at `profile-product-card.svelte:136` and `:162`)
  — none of those are grid siblings that need FLIP reflow.
- Do NOT change any `initial`/`animate`/`exit` values, or the existing
  `delay`/`duration`/`ease` keys already in `transition` — only add the new
  `layout:` sub-key as specified in Step 2.
- Do NOT touch any other file.
- If either cited element's props have changed shape since commit `0894639`
  (e.g. the grid markup restructured, `AnimatePresence` removed), STOP and
  report instead of guessing where to add the props.

## Verification

- **Mechanical**: `pnpm exec svelte-check --tsconfig ./tsconfig.json` from
  `apps/web` — expect 0 errors, 0 warnings.
- **Feel check**: on `/profile/[id]` (your own profile) with 3+ products in
  the grid:
  - Delete a product that isn't the last one in the grid. Confirm the cards
    *after* it slide smoothly into the vacated slot instead of jumping
    instantly the moment the deleted card finishes fading out.
  - Add a new product. Confirm existing cards slide over to make room for
    the new one (which still fades/scales in via its own `initial`/`animate`)
    instead of snapping to a new position the instant the DOM updates.
  - In DevTools Animations panel, set playback to 10% and confirm the
    sibling position change and the entering/exiting card's own
    opacity/scale animation are visually synchronized, not sequential.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the layout
    reflow is still smooth-but-fast rather than jarring (this app wraps
    everything in `MotionConfig reducedMotion="user"` at
    `apps/web/src/routes/+layout.svelte:56`, so `layout` animations should
    already respect it with no extra work).
- **Done when**: both props are added exactly as specified, `svelte-check`
  is clean, and the feel-check confirms sibling cards reflow smoothly on
  both add and remove.
