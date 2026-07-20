import { COUNTRIES, splitE164 } from "./countries";

const BR_COUNTRY_CODE = "55";

/** Brazilian national number: DDD (2) + landline (8) or mobile (9) digits. */
function normalizeBR(nationalDigits: string): string | null {
	if (nationalDigits.length !== 10 && nationalDigits.length !== 11) {
		return null;
	}
	return `+${BR_COUNTRY_CODE}${nationalDigits}`;
}

/**
 * Formats Brazilian national digits (with or without a trailing partial) as
 * "(DD) NNNNN-NNNN". Handles incomplete input too, so the signup mask and the
 * display formatter share one source of truth.
 */
export function formatBrNational(nationalDigits: string): string {
	const digits = nationalDigits.slice(0, 11);
	const ddd = digits.slice(0, 2);
	const rest = digits.slice(2);
	if (digits.length <= 2) {
		return digits.length ? `(${ddd}` : "";
	}
	if (digits.length <= 6) {
		return `(${ddd}) ${rest}`;
	}
	if (digits.length <= 10) {
		return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
	}
	return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

/**
 * Normalizes a phone number to E.164 (e.g. "+5511912345678", "+351904348234").
 *
 * An explicit "+DDI" prefix is treated as international: Brazilian numbers keep
 * the strict DDD + subscriber validation, any other country is accepted as a
 * valid E.164 string (8-15 digits total). Without a leading "+", the number is
 * assumed to be Brazilian (backward compatible with the old DDI-omitted input).
 *
 * Returns null when the digits don't form a valid number.
 */
export function normalizePhone(raw: string): string | null {
	const trimmed = raw.trim();
	const digits = trimmed.replace(/\D/g, "");
	if (!digits) {
		return null;
	}

	if (trimmed.startsWith("+")) {
		// Country code 55 is uniquely Brazil (calling codes are prefix-free).
		if (digits.startsWith(BR_COUNTRY_CODE)) {
			return normalizeBR(digits.slice(BR_COUNTRY_CODE.length));
		}
		if (digits.length < 8 || digits.length > 15) {
			return null;
		}
		return `+${digits}`;
	}

	// No DDI supplied -> assume Brazil.
	const national =
		digits.startsWith(BR_COUNTRY_CODE) && digits.length > 11
			? digits.slice(BR_COUNTRY_CODE.length)
			: digits;
	return normalizeBR(national);
}

/**
 * Formats a stored E.164 phone number for display. Brazilian numbers become
 * "(DD) NNNNN-NNNN"; any other country becomes "+DDI NNN NNN…" with its
 * national digits grouped for readability (e.g. "+351 904 348 234").
 */
export function formatPhone(value: string): string {
	const digits = value.replace(/\D/g, "");

	if (digits.startsWith(BR_COUNTRY_CODE)) {
		const national = digits.slice(BR_COUNTRY_CODE.length);
		if (national.length === 10 || national.length === 11) {
			return formatBrNational(national);
		}
	}

	if (!value.startsWith("+")) {
		return digits ? `+${digits}` : value;
	}

	const { iso, national } = splitE164(value);
	const country = COUNTRIES.find((entry) => entry.iso === iso);
	if (!(country && national)) {
		return value;
	}

	return `+${country.dial} ${groupNationalDigits(national)}`;
}

/**
 * Groups digits in threes for readable display (e.g. "904348234" ->
 * "904 348 234"), taking a group of four when exactly four digits remain so a
 * number never ends in a lone digit (e.g. "5551234567" -> "555 123 4567").
 */
function groupNationalDigits(digits: string): string {
	const groups: string[] = [];
	let index = 0;
	while (index < digits.length) {
		const size = digits.length - index === 4 ? 4 : 3;
		groups.push(digits.slice(index, index + size));
		index += size;
	}
	return groups.join(" ");
}
