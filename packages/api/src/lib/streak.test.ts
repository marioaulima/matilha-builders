import { describe, expect, it } from "vitest";

import { computeCurrentStreak, computeNextStreak, weekIndex } from "./streak";

/**
 * Weeks run Monday 00:00 to Sunday 23:59 in São Paulo time. 2026-07-20 is a
 * Monday, so the `-03:00` offsets below spell out local wall-clock times.
 */
describe("weekIndex", () => {
	it("groups every day from Monday to Sunday into the same week", () => {
		const monday = weekIndex(new Date("2026-07-20T00:00:00-03:00"));
		const sunday = weekIndex(new Date("2026-07-26T23:59:59-03:00"));
		expect(sunday).toBe(monday);
	});

	it("advances at Monday midnight São Paulo time", () => {
		const sundayNight = weekIndex(new Date("2026-07-26T23:59:59-03:00"));
		const mondayMidnight = weekIndex(new Date("2026-07-27T00:00:00-03:00"));
		expect(mondayMidnight).toBe(sundayNight + 1);
	});

	it("keeps Sunday evening in the old week even though UTC already rolled over", () => {
		// 2026-07-26T22:00-03:00 is 2026-07-27T01:00Z — Monday in UTC, still
		// Sunday in São Paulo.
		const sundayEvening = weekIndex(new Date("2026-07-26T22:00:00-03:00"));
		const saturday = weekIndex(new Date("2026-07-25T12:00:00-03:00"));
		expect(sundayEvening).toBe(saturday);
	});
});

describe("computeNextStreak", () => {
	it("starts at 1 for a founder with no prior check-in", () => {
		expect(
			computeNextStreak(0, null, new Date("2026-07-20T09:00:00-03:00"))
		).toBe(1);
	});

	it("does not award a second point for another check-in in the same week", () => {
		const lastCheckInAt = new Date("2026-07-20T09:00:00-03:00");
		const now = new Date("2026-07-24T18:00:00-03:00");
		expect(computeNextStreak(1, lastCheckInAt, now)).toBe(1);
	});

	it("does not award extra points for many check-ins in the same week", () => {
		const week = [
			new Date("2026-07-20T09:00:00-03:00"),
			new Date("2026-07-21T09:00:00-03:00"),
			new Date("2026-07-22T09:00:00-03:00"),
			new Date("2026-07-26T23:00:00-03:00"),
		];
		let streak = 0;
		let lastCheckInAt: Date | null = null;
		for (const at of week) {
			streak = computeNextStreak(streak, lastCheckInAt, at);
			lastCheckInAt = at;
		}
		expect(streak).toBe(1);
	});

	it("increments on the first check-in of the following week", () => {
		const lastCheckInAt = new Date("2026-07-24T18:00:00-03:00");
		const now = new Date("2026-07-27T09:00:00-03:00");
		expect(computeNextStreak(1, lastCheckInAt, now)).toBe(2);
	});

	it("increments right after midnight when the new week starts", () => {
		const lastCheckInAt = new Date("2026-07-26T23:00:00-03:00");
		const now = new Date("2026-07-27T00:01:00-03:00");
		expect(computeNextStreak(1, lastCheckInAt, now)).toBe(2);
	});

	it("increments even when fewer than seven days separate the check-ins", () => {
		// Friday of one week to Wednesday of the next: five days apart, but two
		// distinct weeks.
		const lastCheckInAt = new Date("2026-07-24T15:00:00-03:00");
		const now = new Date("2026-07-29T10:00:00-03:00");
		expect(computeNextStreak(1, lastCheckInAt, now)).toBe(2);
	});

	it("reaches three across three consecutive weeks", () => {
		const checkIns = [
			new Date("2026-07-20T13:00:00-03:00"),
			new Date("2026-07-22T13:00:00-03:00"),
			new Date("2026-07-27T13:00:00-03:00"),
			new Date("2026-07-30T13:00:00-03:00"),
			new Date("2026-08-03T13:00:00-03:00"),
		];
		let streak = 0;
		let lastCheckInAt: Date | null = null;
		for (const at of checkIns) {
			streak = computeNextStreak(streak, lastCheckInAt, at);
			lastCheckInAt = at;
		}
		expect(streak).toBe(3);
	});

	it("resets to 1 after a full week was skipped", () => {
		const lastCheckInAt = new Date("2026-07-20T09:00:00-03:00");
		const now = new Date("2026-08-03T09:00:00-03:00");
		expect(computeNextStreak(5, lastCheckInAt, now)).toBe(1);
	});

	it("never leaves a founder who just checked in below 1", () => {
		const lastCheckInAt = new Date("2026-07-20T09:00:00-03:00");
		const now = new Date("2026-07-22T09:00:00-03:00");
		expect(computeNextStreak(0, lastCheckInAt, now)).toBe(1);
	});
});

describe("computeCurrentStreak", () => {
	it("keeps the stored streak during the week of the check-in", () => {
		const lastCheckInAt = new Date("2026-07-27T09:00:00-03:00");
		const now = new Date("2026-07-31T09:00:00-03:00");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(3);
	});

	it("keeps the stored streak while the next week is still running", () => {
		const lastCheckInAt = new Date("2026-07-20T09:00:00-03:00");
		const now = new Date("2026-07-29T09:00:00-03:00");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(3);
	});

	it("becomes -1 once a full week was skipped", () => {
		const lastCheckInAt = new Date("2026-07-20T09:00:00-03:00");
		const now = new Date("2026-08-03T09:00:00-03:00");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(-1);
	});

	it("decreases by one for each additional skipped week", () => {
		const lastCheckInAt = new Date("2026-07-20T09:00:00-03:00");
		const now = new Date("2026-08-10T09:00:00-03:00");
		expect(computeCurrentStreak(3, lastCheckInAt, now)).toBe(-2);
	});

	it("keeps the stored streak for a founder who never checked in", () => {
		expect(
			computeCurrentStreak(0, null, new Date("2026-08-10T09:00:00-03:00"))
		).toBe(0);
	});
});
