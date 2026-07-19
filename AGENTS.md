# Project Instructions

## UI components (apps/web)

For UI-related tasks, always use existing shadcn-svelte primitives (`apps/web/src/lib/components/ui/`) instead of building a component from scratch. If the needed primitive isn't installed yet, add it with:

```bash
pnpm exec shadcn-svelte add <component>
```

(run from `apps/web`). Only hand-roll a component when no shadcn-svelte primitive fits.
