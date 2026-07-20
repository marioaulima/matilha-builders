export interface Country {
	/** Country calling code (DDI) without the leading "+". */
	dial: string;
	/** ISO 3166-1 alpha-2 code, used as the unique select value. */
	iso: string;
	name: string;
	/**
	 * Canonical country for a calling code shared by several countries
	 * (e.g. "+1" → US, not CA), used when resolving an E.164 back to a country.
	 */
	primary?: boolean;
}

/**
 * Curated list of countries with their calling codes (DDI). Shared between the
 * signup UI (country selector) and the phone normalization/formatting helpers.
 *
 * Brazil is first so it stays the default; Portugal second since it's the most
 * common non-BR case for this audience. The rest is alphabetical.
 */
const BRAZIL: Country = { dial: "55", iso: "BR", name: "Brasil" };

export const COUNTRIES: Country[] = [
	BRAZIL,
	{ dial: "351", iso: "PT", name: "Portugal" },
	{ dial: "244", iso: "AO", name: "Angola" },
	{ dial: "54", iso: "AR", name: "Argentina" },
	{ dial: "61", iso: "AU", name: "Austrália" },
	{ dial: "43", iso: "AT", name: "Áustria" },
	{ dial: "32", iso: "BE", name: "Bélgica" },
	{ dial: "591", iso: "BO", name: "Bolívia" },
	{ dial: "1", iso: "CA", name: "Canadá" },
	{ dial: "56", iso: "CL", name: "Chile" },
	{ dial: "86", iso: "CN", name: "China" },
	{ dial: "57", iso: "CO", name: "Colômbia" },
	{ dial: "82", iso: "KR", name: "Coreia do Sul" },
	{ dial: "506", iso: "CR", name: "Costa Rica" },
	{ dial: "385", iso: "HR", name: "Croácia" },
	{ dial: "45", iso: "DK", name: "Dinamarca" },
	{ dial: "20", iso: "EG", name: "Egito" },
	{ dial: "971", iso: "AE", name: "Emirados Árabes Unidos" },
	{ dial: "593", iso: "EC", name: "Equador" },
	{ dial: "34", iso: "ES", name: "Espanha" },
	{ dial: "1", iso: "US", name: "Estados Unidos", primary: true },
	{ dial: "63", iso: "PH", name: "Filipinas" },
	{ dial: "358", iso: "FI", name: "Finlândia" },
	{ dial: "33", iso: "FR", name: "França" },
	{ dial: "30", iso: "GR", name: "Grécia" },
	{ dial: "31", iso: "NL", name: "Holanda" },
	{ dial: "852", iso: "HK", name: "Hong Kong" },
	{ dial: "91", iso: "IN", name: "Índia" },
	{ dial: "62", iso: "ID", name: "Indonésia" },
	{ dial: "353", iso: "IE", name: "Irlanda" },
	{ dial: "972", iso: "IL", name: "Israel" },
	{ dial: "39", iso: "IT", name: "Itália" },
	{ dial: "81", iso: "JP", name: "Japão" },
	{ dial: "352", iso: "LU", name: "Luxemburgo" },
	{ dial: "60", iso: "MY", name: "Malásia" },
	{ dial: "52", iso: "MX", name: "México" },
	{ dial: "258", iso: "MZ", name: "Moçambique" },
	{ dial: "47", iso: "NO", name: "Noruega" },
	{ dial: "64", iso: "NZ", name: "Nova Zelândia" },
	{ dial: "595", iso: "PY", name: "Paraguai" },
	{ dial: "51", iso: "PE", name: "Peru" },
	{ dial: "48", iso: "PL", name: "Polônia" },
	{ dial: "44", iso: "GB", name: "Reino Unido" },
	{ dial: "420", iso: "CZ", name: "República Tcheca" },
	{ dial: "40", iso: "RO", name: "Romênia" },
	{ dial: "7", iso: "RU", name: "Rússia" },
	{ dial: "65", iso: "SG", name: "Singapura" },
	{ dial: "27", iso: "ZA", name: "África do Sul" },
	{ dial: "46", iso: "SE", name: "Suécia" },
	{ dial: "41", iso: "CH", name: "Suíça" },
	{ dial: "66", iso: "TH", name: "Tailândia" },
	{ dial: "90", iso: "TR", name: "Turquia" },
	{ dial: "380", iso: "UA", name: "Ucrânia" },
	{ dial: "598", iso: "UY", name: "Uruguai" },
	{ dial: "58", iso: "VE", name: "Venezuela" },
];

export const DEFAULT_COUNTRY: Country = BRAZIL;

/** Turns an ISO 3166-1 alpha-2 code into its flag emoji. */
export function flagFromIso(iso: string): string {
	return iso
		.toUpperCase()
		.replace(/./g, (char) =>
			String.fromCodePoint(127_397 + char.charCodeAt(0))
		);
}

export function findCountryByIso(iso: string): Country | undefined {
	return COUNTRIES.find((country) => country.iso === iso);
}

/**
 * Splits a stored E.164 value (e.g. "+5511912345678") into the matching
 * country and its national number. Among countries that share a calling code
 * (e.g. "+1"), the one flagged `primary` wins. Falls back to the default
 * country, treating the whole thing as a national number, when nothing matches.
 */
export function splitE164(value: string): { iso: string; national: string } {
	const digits = value.replace(/\D/g, "");
	if (!(value.startsWith("+") && digits)) {
		return { iso: DEFAULT_COUNTRY.iso, national: digits };
	}

	const matches = COUNTRIES.filter((country) =>
		digits.startsWith(country.dial)
	);
	if (matches.length === 0) {
		return { iso: DEFAULT_COUNTRY.iso, national: digits };
	}

	// Longest dial-code prefix wins so "+1" doesn't shadow "+xxx"; among ties
	// (shared codes like "+1") the country flagged `primary` is canonical.
	const longestDial = Math.max(
		...matches.map((country) => country.dial.length)
	);
	const longest = matches.filter(
		(country) => country.dial.length === longestDial
	);
	const chosen = longest.find((country) => country.primary) ?? longest[0];
	if (!chosen) {
		return { iso: DEFAULT_COUNTRY.iso, national: digits };
	}

	return { iso: chosen.iso, national: digits.slice(chosen.dial.length) };
}
