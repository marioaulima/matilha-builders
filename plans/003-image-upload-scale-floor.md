# 003 — Raise ImageUploadButton icon-swap scale off the sub-catalog floor

- **Status**: TODO
- **Commit**: c9d0df2
- **Severity**: LOW
- **Category**: Physicality & origin
- **Estimated scope**: 1 file, 4 occurrences

## Problem

`apps/web/src/lib/components/matilha/ImageUploadButton.svelte` has four
`AnimatePresence`-wrapped icon-swap transitions (loading spinner ↔ pencil/plus
icon), all using `scale: 0.8` for `initial`/`exit`:

```svelte
<!-- apps/web/src/lib/components/matilha/ImageUploadButton.svelte:86-107 — current (overlay variant) -->
<motion.span
	animate={{ opacity: 1, scale: 1 }}
	exit={{ opacity: 0, scale: 0.8 }}
	initial={{ opacity: 0, scale: 0.8 }}
	key="loading"
	transition={{ duration: 0.15 }}
>
	<LoaderCircleIcon class="size-4 animate-spin text-white" />
</motion.span>
<!-- ... -->
<motion.span
	animate={{ opacity: 1, scale: 1 }}
	exit={{ opacity: 0, scale: 0.8 }}
	initial={{ opacity: 0, scale: 0.8 }}
	key="pencil"
	transition={{ duration: 0.15 }}
>
	<PencilIcon class="size-4 text-white" />
</motion.span>
```

The same `scale: 0.8` pattern repeats at lines 96-101 and 119-137 (the
`iconOnly` variant's loading/add-icon swap). The AUDIT catalog's physicality
target range is `scale(0.9–0.97)` for entrances (never `scale(0)`, and 0.8 sits
noticeably below that floor — for a 16px icon it reads as a slightly-too-eager
pop rather than a subtle materialize).

## Target

Replace every `scale: 0.8` (both `initial` and `exit`, all 4 occurrences) with
`scale: 0.92`:

```svelte
<!-- target, applied identically to all 4 occurrences -->
<motion.span
	animate={{ opacity: 1, scale: 1 }}
	exit={{ opacity: 0, scale: 0.92 }}
	initial={{ opacity: 0, scale: 0.92 }}
	key="loading"
	transition={{ duration: 0.15 }}
>
```

## Repo conventions to follow

- This matches the range already used elsewhere in the repo for small
  entrance pops, e.g. `apps/web/src/lib/components/matilha/FounderCard.svelte:102-103`
  (`initial={{ opacity: 0, scale: 0.9 }}`) and
  `apps/web/src/routes/profile/[id]/+page.svelte:789-790`
  (`exit={{ opacity: 0, scale: 0.96 }}`).
- Keep `duration: 0.15` and every other prop on these 4 elements unchanged —
  this plan only touches the numeric `scale` value.

## Steps

1. Open `apps/web/src/lib/components/matilha/ImageUploadButton.svelte`.
2. Find all 4 occurrences of `scale: 0.8` (two pairs — each pair is one
   `initial`/`exit` combination, once for the `overlay` variant's loading/pencil
   swap around lines 86-107, once for the `iconOnly` variant's loading/add-icon
   swap around lines 117-137). Replace each `0.8` with `0.92`. Do not change
   `scale: 1` in the `animate` props — only the `0.8` values.

## Boundaries

- Do NOT touch the non-`overlay`/non-`iconOnly` (plain `Button`) branch of this
  component — it has no motion (it just swaps button label text).
- Do NOT change `duration`, `opacity` values, or any other prop.
- Do NOT touch any other file.
- If the exact `scale: 0.8` occurrences found differ in count or location from
  the 4 described here (drift since commit `c9d0df2`), STOP and report instead
  of guessing which to change.

## Verification

- **Mechanical**: `pnpm exec svelte-check --tsconfig ./tsconfig.json` from
  `apps/web` — expect 0 errors, 0 warnings.
- **Feel check** (not required to run this session per explicit instruction to
  skip E2E/browser validation):
  - Hover your own avatar on `/profile/[id]`, click to open the file picker,
    watch the pencil-icon overlay swap — the entrance should look marginally
    less "poppy" than before, still crisp at 150ms.
  - Same check on a product's photo-upload icon button (profile page, product
    card action row).
  - In DevTools Animations panel, set playback to 10% and confirm the icon
    never starts from more than ~8% smaller than its resting size.
- **Done when**: all 4 `scale: 0.8` values are `0.92`, `svelte-check` is clean.
