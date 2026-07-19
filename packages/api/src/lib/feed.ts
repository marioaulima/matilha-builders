export type FeedCheckIn = {
	id: string;
	streak: number;
	createdAt: Date;
};

const SPOTLIGHT_WINDOW_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** "Spotlight da semana": highest-streak check-in from the last 7 days, ties broken by newest. */
export function pickSpotlightId(
	checkIns: FeedCheckIn[],
	now: Date
): string | null {
	const recent = checkIns.filter(
		(c) =>
			(now.getTime() - c.createdAt.getTime()) / MS_PER_DAY <=
			SPOTLIGHT_WINDOW_DAYS
	);
	if (recent.length === 0) {
		return null;
	}
	const [top] = [...recent].sort(
		(a, b) =>
			b.streak - a.streak || b.createdAt.getTime() - a.createdAt.getTime()
	);
	return top?.id ?? null;
}
