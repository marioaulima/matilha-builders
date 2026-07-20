import { describe, expect, it } from "vitest";

import { computeCurrentStreak, computeNextStreak } from "./streak";

describe("computeNextStreak", () => {
	it("starts at 1 for a founder with no prior check-in", () => {
		expect(computeNextStreak(0, null, new Date("2026-07-18T00:00:00Z"))).toBe(
			1
		);
	});

	it("increments when the previous check-in was within the grace window", () => {
		const lastCheckInAt = new Date("2026-07-11T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeNextStreak(4, lastCheckInAt, now)).toBe(5);
	});

	it("resets to 1 after two full weeks without a check-in", () => {
		const lastCheckInAt = new Date("2026-06-01T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeNextStreak(6, lastCheckInAt, now)).toBe(1);
	});

	it("still increments within the two-week window", () => {
		const lastCheckInAt = new Date("2026-07-08T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeNextStreak(2, lastCheckInAt, now)).toBe(3);
	});

	it("resets on the two-week boundary", () => {
		const lastCheckInAt = new Date("2026-07-04T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeNextStreak(2, lastCheckInAt, now)).toBe(1);
	});
});

describe("computeCurrentStreak", () => {
	it("keeps the stored streak before two full weeks have passed", () => {
		const lastCheckInAt = new Date("2026-07-05T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(3);
	});

	it("becomes -1 after two full weeks without a check-in", () => {
		const lastCheckInAt = new Date("2026-07-04T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(-1);
	});

	it("decreases by one after each additional full week without a check-in", () => {
		const lastCheckInAt = new Date("2026-06-27T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(-2);
	});
});
