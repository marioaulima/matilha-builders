import { describe, expect, it } from "vitest";

import { computeNextStreak } from "./streak";

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

	it("resets to 1 when the gap exceeds the grace window", () => {
		const lastCheckInAt = new Date("2026-06-01T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeNextStreak(6, lastCheckInAt, now)).toBe(1);
	});

	it("still increments right at the grace-window boundary (10 days)", () => {
		const lastCheckInAt = new Date("2026-07-08T00:00:00Z");
		const now = new Date("2026-07-18T00:00:00Z");
		expect(computeNextStreak(2, lastCheckInAt, now)).toBe(3);
	});
});
