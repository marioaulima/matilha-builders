import { describe, expect, it } from "vitest";

import { formatRelative } from "./format";

describe("formatRelative", () => {
	const now = new Date("2026-07-18T12:00:00Z");

	it("shows minutes for gaps under an hour", () => {
		expect(formatRelative(new Date("2026-07-18T11:55:00Z"), now)).toBe(
			"há 5 minutos"
		);
	});

	it("uses singular hour", () => {
		expect(formatRelative(new Date("2026-07-18T11:00:00Z"), now)).toBe(
			"há 1 hora"
		);
	});

	it("shows days for gaps of a day or more", () => {
		expect(formatRelative(new Date("2026-07-16T12:00:00Z"), now)).toBe(
			"há 2 dias"
		);
	});

	it("accepts an ISO string", () => {
		expect(formatRelative("2026-07-17T12:00:00Z", now)).toBe("há 1 dia");
	});
});
