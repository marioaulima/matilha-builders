const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** pt-BR relative time, matching the design's "há 2 dias" / "há 5 horas" copy. */
export function formatRelative(
	date: string | Date,
	now: Date = new Date()
): string {
	const target = typeof date === "string" ? new Date(date) : date;
	const diffSeconds = Math.max(0, (now.getTime() - target.getTime()) / 1000);

	if (diffSeconds < MINUTE) {
		return "agora";
	}
	if (diffSeconds < HOUR) {
		const minutes = Math.floor(diffSeconds / MINUTE);
		return `há ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
	}
	if (diffSeconds < DAY) {
		const hours = Math.floor(diffSeconds / HOUR);
		return `há ${hours} ${hours === 1 ? "hora" : "horas"}`;
	}
	const days = Math.floor(diffSeconds / DAY);
	return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}
