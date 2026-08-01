import { createRouterClient } from "@orpc/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, insertValues, updateWhere } = vi.hoisted(() => {
	interface SelectChain {
		from: () => SelectChain;
		limit: () => Promise<unknown[]>;
		orderBy: () => SelectChain;
		where: () => SelectChain;
	}

	const insertValuesMock = vi.fn(async () => undefined);
	const updateWhereMock = vi.fn(async () => undefined);
	const databaseMock = {
		insert: vi.fn(() => ({ values: insertValuesMock })),
		select: vi.fn((fields: Record<string, unknown>) => {
			const keys = Object.keys(fields);
			let rows: unknown[];
			if (keys.includes("founderId")) {
				rows = [{ founderId: "founder-1" }];
			} else if (keys.includes("createdAt")) {
				rows = [{ createdAt: new Date("2026-07-21T12:00:00Z") }];
			} else {
				rows = [
					{
						lastCheckInAt: new Date("2026-07-21T12:00:00Z"),
						streak: 4,
					},
				];
			}
			const chain = {} as SelectChain;
			chain.from = () => chain;
			chain.limit = async () => rows;
			chain.orderBy = () => chain;
			chain.where = () => chain;
			return chain;
		}),
		update: vi.fn(() => ({
			set: vi.fn(() => ({ where: updateWhereMock })),
		})),
	};
	return {
		dbMock: databaseMock,
		insertValues: insertValuesMock,
		updateWhere: updateWhereMock,
	};
});

vi.mock("@matilha-builders/db", () => ({ db: dbMock }));

import { matilhaRouter } from "./matilha";

// The mocked founder last checked in on 2026-07-21, in the calendar week
// starting Monday 2026-07-20 (São Paulo time), with a stored streak of 4.
const client = createRouterClient(matilhaRouter, {
	context: {
		session: { user: { id: "founder-1" } },
	} as never,
});

describe("checkIns.create", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("records another check-in during the same week without scoring again", async () => {
		vi.setSystemTime(new Date("2026-07-23T12:00:00Z"));

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

	it("scores a point on the first check-in of the following week", async () => {
		vi.setSystemTime(new Date("2026-07-29T12:00:00Z"));

		await expect(
			client.checkIns.create({
				blocked: "Nothing",
				productId: "product-1",
				progress: "Shipped another iteration",
			})
		).resolves.toEqual({ streak: 5 });
	});
});
