# 002 — Replace `transition-all` with explicit properties on Button and avatar overlay

- **Status**: TODO
- **Commit**: c9d0df2
- **Severity**: MEDIUM
- **Category**: Performance / Cohesion
- **Estimated scope**: 2 files

## Problem

`transition: all` (Tailwind's `transition-all`) transitions every animatable CSS
property, including layout-triggering ones, even when only a couple of
properties actually change. Two spots use it:

```ts
// apps/web/src/lib/components/ui/button/button.svelte:10 — current
base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
```

This is the shared base for every `Button` in the app (used on essentially every
page). The only things that actually change on this element are: background
color, border color, ring, and the `translate-y-px` press feedback on `:active`.
`transition-all` also arms transitions for any other property that might change
(e.g. via `disabled:opacity-50`), which is unintended surface for the browser to
watch.

```svelte
<!-- apps/web/src/lib/components/matilha/ImageUploadButton.svelte:82 — current -->
<span
	class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-200 group-hover/avatar:bg-black/50 group-hover/avatar:opacity-100"
>
```

Only `background-color` and `opacity` change here (the hover overlay circle over
the avatar upload button).

## Target

```ts
// apps/web/src/lib/components/ui/button/button.svelte:10 — target
base: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-md border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
```

(Replace the single `transition-all` token in place; every other class stays
exactly as-is, same position in the string.)

```svelte
<!-- apps/web/src/lib/components/matilha/ImageUploadButton.svelte:82 — target -->
<span
	class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-[background-color,opacity] duration-200 group-hover/avatar:bg-black/50 group-hover/avatar:opacity-100"
>
```

## Repo conventions to follow

- `apps/web/src/lib/components/matilha/FounderCard.svelte:74` already does this
  correctly and is the exemplar to imitate:
  ```svelte
  class="... transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-out)] ..."
  ```
  Follow the same `transition-[prop,prop,...]` bracket syntax (Tailwind
  arbitrary-value transition-property list), comma-separated, no spaces after
  commas — matching this file's exact formatting.

## Steps

1. Open `apps/web/src/lib/components/ui/button/button.svelte`. In the `base`
   string (line 10), find the token `transition-all` and replace it in place
   with `transition-[color,background-color,border-color,box-shadow,transform]`.
   Do not reorder any other class in the string.

2. Open `apps/web/src/lib/components/matilha/ImageUploadButton.svelte`. On line
   82, find `transition-all duration-200` and replace `transition-all` with
   `transition-[background-color,opacity]`, keeping `duration-200` immediately
   after it as it is now.

## Boundaries

- Do NOT touch any other file — `select-trigger.svelte` and other shadcn
  primitives are out of scope for this plan even if they also use
  `transition-all`-like patterns elsewhere; only the two locations above.
- Do NOT change `duration-200`, or any other timing/easing value on either
  element.
- Do NOT change markup structure, only the two class strings named above.
- If either line's surrounding class string has changed since commit `c9d0df2`
  such that `transition-all` no longer appears where expected, STOP and report
  instead of guessing which token to replace.

## Verification

- **Mechanical**: `pnpm exec svelte-check --tsconfig ./tsconfig.json` from
  `apps/web` — expect 0 errors, 0 warnings.
- **Feel check** (not required to run this session per explicit instruction to
  skip E2E/browser validation):
  - Hover and click any `Button` in the app (e.g. "Postar check-in" on
    `/board`): background/border/ring transitions should look identical to
    before, and the 1px press-down on click should still be visible.
  - Hover the avatar on `/profile/[id]` when it's your own profile: the
    dark overlay + pencil icon should still fade in/out exactly as before.
  - In DevTools' Rendering panel, enable "Paint flashing" and confirm no new
    paint regions appear beyond what was already painting pre-change.
- **Done when**: both `transition-all` occurrences are replaced with the
  explicit property lists above, `svelte-check` is clean, and no visual
  difference is observable in either component's hover/press feedback.
