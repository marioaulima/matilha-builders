# 004 — Apply the repo's stagger convention to the two lists missing it

- **Status**: TODO
- **Commit**: c9d0df2
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 2 files

## Problem

Three of the app's five animated list/grid entrances stagger their items with
`delay: index * 0.04` (a 40ms-per-item stagger, inside the AUDIT catalog's
30-80ms recommended band):

- `apps/web/src/lib/components/matilha/FounderCard.svelte:80` (board grid)
- `apps/web/src/lib/components/matilha/CheckInItem.svelte:37` (used by both
  `/feed` and the profile check-in history — both already pass an `index` prop
  through)

Two lists don't, so their items all fade/scale in simultaneously instead of
cascading like every other list in the app:

```svelte
<!-- apps/web/src/routes/profile/[id]/+page.svelte:772-786 — current -->
{#if founder.products.length}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
		<AnimatePresence>
			{#each founder.products as p (p._key ?? p.id)}
				<motion.div
					animate={{ opacity: 1, scale: 1, y: 0 }}
					class="flex flex-col gap-4 rounded-xl border border-border p-4"
					exit={{ opacity: 0, scale: 0.96 }}
					initial={{ opacity: 0, scale: 0.96, y: 8 }}
					key={p._key ?? p.id}
					transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
				>
```

```svelte
<!-- apps/web/src/routes/requests/+page.svelte:123-133 — current -->
<div class="flex flex-col gap-3">
	<AnimatePresence>
		{#each pendingUsers as request (request.userId)}
			<motion.div
				animate={{ opacity: 1, scale: 1, y: 0 }}
				class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
				exit={{ opacity: 0, scale: 0.97 }}
				initial={{ opacity: 0, y: 8 }}
				key={request.userId}
				transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
			>
```

## Target

```svelte
<!-- apps/web/src/routes/profile/[id]/+page.svelte — target -->
{#each founder.products as p, index (p._key ?? p.id)}
	<motion.div
		animate={{ opacity: 1, scale: 1, y: 0 }}
		class="flex flex-col gap-4 rounded-xl border border-border p-4"
		exit={{ opacity: 0, scale: 0.96 }}
		initial={{ opacity: 0, scale: 0.96, y: 8 }}
		key={p._key ?? p.id}
		transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
	>
```

```svelte
<!-- apps/web/src/routes/requests/+page.svelte — target -->
{#each pendingUsers as request, index (request.userId)}
	<motion.div
		animate={{ opacity: 1, scale: 1, y: 0 }}
		class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
		exit={{ opacity: 0, scale: 0.97 }}
		initial={{ opacity: 0, y: 8 }}
		key={request.userId}
		transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
	>
```

## Repo conventions to follow

- `delay: index * 0.04` is the exact expression used at
  `apps/web/src/lib/components/matilha/FounderCard.svelte:80` and
  `apps/web/src/lib/components/matilha/CheckInItem.svelte:37` — reuse that
  literal expression, don't introduce a different multiplier.
- Stagger is decorative only — it must not gate interactivity. Both targets
  above only add the `delay` key inside the existing `transition={{ ... }}`
  object; nothing about click handlers, mutation state, or exit timing changes.

## Steps

1. Open `apps/web/src/routes/profile/[id]/+page.svelte`. Find the products
   `{#each founder.products as p (p._key ?? p.id)}` (around line 777). Add
   `, index` after `p` so it reads
   `{#each founder.products as p, index (p._key ?? p.id)}`. Then in the
   `motion.div` immediately inside that block, find
   `transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}` (around line 784)
   and change it to
   `transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}`.

2. Open `apps/web/src/routes/requests/+page.svelte`. Find
   `{#each pendingUsers as request (request.userId)}` (around line 125). Add
   `, index` so it reads
   `{#each pendingUsers as request, index (request.userId)}`. Then in the
   `motion.div` immediately inside, find
   `transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}` (around line 132)
   and change it to
   `transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}`.

## Boundaries

- Do NOT add stagger to any other list — `FounderCard`/`CheckInItem` already
  have it; leave everything else (edit-mode forms, drawer contents, single
  add-product panel) untouched.
- Do NOT change the exit animation, scale/opacity/y target values, or duration
  — only add the `index` each-binding and the `delay` transition key.
- Do NOT touch any other file.
- If the `{#each}` block or the `transition={{ ... }}` object at either cited
  location has changed shape since commit `c9d0df2` (e.g. destructuring
  changed, transition object restructured), STOP and report instead of
  guessing where to insert `delay`.

## Verification

- **Mechanical**: `pnpm exec svelte-check --tsconfig ./tsconfig.json` from
  `apps/web` — expect 0 errors, 0 warnings.
- **Feel check** (not required to run this session per explicit instruction to
  skip E2E/browser validation):
  - On `/profile/[id]` (your own profile, with 2+ products), reload: product
    cards should cascade in with a ~40ms stagger instead of all appearing at
    once — compare visually against the board grid's founder-card stagger,
    they should feel the same cadence.
  - On `/requests` (super-admin account, with 2+ pending signups), reload:
    same cascading effect on the pending-request cards.
  - Confirm approving/rejecting a request still removes just that one card
    instantly (the stagger only affects entrance, not the optimistic removal
    path).
- **Done when**: both `{#each}` bindings include `index`, both `transition`
  objects include `delay: index * 0.04`, and `svelte-check` is clean.
