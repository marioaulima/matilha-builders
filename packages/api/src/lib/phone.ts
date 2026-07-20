const BR_COUNTRY_CODE = "55";

/**
 * Normalizes a Brazilian phone number to E.164 (+55DDNNNNNNNNN).
 * Accepts any punctuation/spacing and an optional leading "55" or "+55".
 * Returns null if the digits don't form a valid BR mobile/landline number.
 */
export function normalizePhoneBR(raw: string): string | null {
	let digits = raw.replace(/\D/g, "");

	if (digits.startsWith(BR_COUNTRY_CODE) && digits.length > 11) {
		digits = digits.slice(BR_COUNTRY_CODE.length);
	}

	// DDD (2) + landline (8) or mobile (9) subscriber number
	if (digits.length !== 10 && digits.length !== 11) {
		return null;
	}

	return `+${BR_COUNTRY_CODE}${digits}`;
}

/**
 * Formats a normalized E.164 BR phone (or raw digits) for display,
 * e.g. "+5511912345678" -> "(11) 91234-5678".
 */
export function formatPhoneBR(value: string): string {
	let digits = value.replace(/\D/g, "");
	if (digits.startsWith(BR_COUNTRY_CODE) && digits.length > 11) {
		digits = digits.slice(BR_COUNTRY_CODE.length);
	}

	const ddd = digits.slice(0, 2);
	const rest = digits.slice(2);

	if (digits.length === 11) {
		return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
	}
	if (digits.length === 10) {
		return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
	}
	return value;
}
