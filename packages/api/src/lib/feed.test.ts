import { describe, expect, it } from "vitest";

import { pickSpotlightId } from "./feed";

const now = new Date("2026-07-18T12:00:00Z");

describe("pickSpotlightId", () => {
	it("returns null when there are no check-ins", () => {
		expect(pickSpotlightId([], now)).toBeNull();
	});

	it("returns null when nothing is within the spotlight window", () => {
		const checkIns = [
			{ createdAt: new Date("2026-06-01T00:00:00Z"), id: "a", streak: 10 },
		];
		expect(pickSpotlightId(checkIns, now)).toBeNull();
	});

	it("picks the highest-streak check-in among recent ones", () => {
		const checkIns = [
			{ createdAt: new Date("2026-07-17T00:00:00Z"), id: "low", streak: 1 },
			{ createdAt: new Date("2026-07-16T00:00:00Z"), id: "high", streak: 6 },
		];
		expect(pickSpotlightId(checkIns, now)).toBe("high");
	});

	it("breaks streak ties by picking the newest", () => {
		const checkIns = [
			{ createdAt: new Date("2026-07-15T00:00:00Z"), id: "older", streak: 3 },
			{ createdAt: new Date("2026-07-17T00:00:00Z"), id: "newer", streak: 3 },
		];
		expect(pickSpotlightId(checkIns, now)).toBe("newer");
	});
});
