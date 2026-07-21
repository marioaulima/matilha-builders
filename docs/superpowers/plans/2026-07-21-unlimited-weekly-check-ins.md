# Unlimited Weekly Check-ins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow founders to post unlimited check-ins in a week while advancing their streak at most once in that period.

**Architecture:** Remove the per-product time gate from the create procedure and make the check-in form treat every owned product as selectable. Keep the existing products response shape to avoid conflicting with open PR #3; the form ignores its lock metadata, while the existing streak calculation continues to absorb same-week posts without incrementing the streak.

**Tech Stack:** TypeScript, oRPC, Drizzle ORM, Vitest, Svelte 5, pnpm/Turborepo

---

### Task 1: Prove and remove the server-side weekly restriction

**Files:**
- Create: `packages/api/src/routers/matilha.test.ts`
- Modify: `packages/api/src/routers/matilha.ts:153-177`

- [ ] **Step 1: Write the failing router regression test**

Create `packages/api/src/routers/matilha.test.ts` with a fake Drizzle query surface. It presents a recent check-in for the same product, then calls the real oRPC procedure and expects the new post to be stored without advancing the streak:

```ts
import { createRouterClient } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, insertValues, updateWhere } = vi.hoisted(() => {
	type SelectChain = {
		from: () => SelectChain;
		limit: () => Promise<unknown[]>;
		orderBy: () => SelectChain;
		where: () => SelectChain;
	};

	const insertValues = vi.fn(async () => undefined);
	const updateWhere = vi.fn(async () => undefined);
	const dbMock = {
		insert: vi.fn(() => ({ values: insertValues })),
		select: vi.fn((fields: Record<string, unknown>) => {
			const keys = Object.keys(fields);
			const rows = keys.includes("founderId")
				? [{ founderId: "founder-1" }]
				: keys.includes("createdAt")
					? [{ createdAt: new Date("2026-07-21T12:00:00Z") }]
					: [
							{
								lastCheckInAt: new Date("2026-07-21T12:00:00Z"),
								streak: 4,
							},
						];
			const chain = {} as SelectChain;
			chain.from = () => chain;
			chain.limit = async () => rows;
			chain.orderBy = () => chain;
			chain.where = () => chain;
			return chain;
		}),
		update: vi.fn(() => ({
			set: vi.fn(() => ({ where: updateWhere })),
		})),
	};
	return { dbMock, insertValues, updateWhere };
});

vi.mock("@matilha-builders/db", () => ({ db: dbMock }));

import { matilhaRouter } from "./matilha";

describe("checkIns.create", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("accepts another check-in for the same product during the same week", async () => {
		const client = createRouterClient(matilhaRouter, {
			context: {
				session: { user: { id: "founder-1" } },
			} as never,
		});

		await expect(
			client.checkIns.create({
				blocked: "Nothing",
				productId: "product-1",
				progress: "Shipped another iteration",
			})
		).resolves.toEqual({ streak: 4 });
		expect(insertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				founderId: "founder-1",
				productId: "product-1",
			})
		);
		expect(updateWhere).toHaveBeenCalledOnce();
	});
});
```

- [ ] **Step 2: Run the regression test and verify RED**

Run:

```bash
pnpm --filter @matilha-builders/api test -- src/routers/matilha.test.ts
```

Expected: FAIL because `checkIns.create` throws the current `BAD_REQUEST` message for a recent same-product check-in.

- [ ] **Step 3: Remove the API gate**

Keep product ownership validation in `checkIns.create`, but remove the latest-check-in query and rejection. Leave `products.mine` unchanged so its existing response remains compatible with open PR #3:

```ts
const founderId = context.session.user.id;
if (input.productId) {
	await requireOwnedProduct(input.productId, founderId);
}
```

- [ ] **Step 4: Run the focused and full API tests and verify GREEN**

Run:

```bash
pnpm --filter @matilha-builders/api test -- src/routers/matilha.test.ts
pnpm --filter @matilha-builders/api test
```

Expected: the focused regression and the complete API test suite pass with zero failures.

### Task 2: Remove the client-side product lock

**Files:**
- Modify: `apps/web/src/routes/checkin/+page.svelte:295-307`

- [ ] **Step 1: Make every product selectable**

Replace the locked product item with the repository's original plain item shape:

```svelte
{#each products as p (p.id)}
	<Select.Item label={p.name} value={p.id}>
		{p.name}
	</Select.Item>
{/each}
```

- [ ] **Step 2: Run web validation**

Run:

```bash
pnpm --filter web test
pnpm --filter web check
```

Expected: web unit tests pass and `svelte-check` reports zero errors and zero warnings.

### Task 3: Verify and commit the implementation

**Files:**
- Verify: `packages/api/src/routers/matilha.test.ts`
- Verify: `packages/api/src/routers/matilha.ts`
- Verify: `apps/web/src/routes/checkin/+page.svelte`

- [ ] **Step 1: Run repository-wide checks**

Run:

```bash
pnpm check-types
pnpm check
pnpm build
git diff --check
```

Expected: all commands exit successfully with no new diagnostics.

- [ ] **Step 2: Confirm scope and open-PR compatibility**

Run:

```bash
git status --short
git diff --stat origin/main...HEAD
git diff origin/main...HEAD -- packages/api/src/routers/matilha.ts apps/web/src/routes/checkin/+page.svelte packages/api/src/routers/matilha.test.ts
gh pr diff 3 --name-only
```

Expected: only the approved spec/plan and three implementation files are in scope. PR #3 overlaps `packages/api/src/routers/matilha.ts` only, with its additions outside the changed create and products sections.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add packages/api/src/routers/matilha.test.ts packages/api/src/routers/matilha.ts apps/web/src/routes/checkin/+page.svelte
git -c commit.gpgsign=false commit -m "Allow unlimited weekly check-ins"
```

Expected: one focused implementation commit is created after the already-committed design and plan documentation.
