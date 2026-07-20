const MAX_STREAK_GAP_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ONE_WEEK_MS = 7 * MS_PER_DAY;

/**
 * Weekly check-in cadence with two weeks of slack: a check-in before a full
 * two-week gap continues the streak; a longer gap resets it to 1. Multiple
 * check-ins within the same week (any product) don't advance the streak
 * further — it only counts the first one until a new week starts.
 */
export function computeNextStreak(
	previousStreak: number,
	lastCheckInAt: Date | null,
	now: Date
): number {
	if (!lastCheckInAt) {
		return 1;
	}
	const diffDays = (now.getTime() - lastCheckInAt.getTime()) / MS_PER_DAY;
	if (diffDays < 7) {
		return previousStreak;
	}
	return diffDays < MAX_STREAK_GAP_DAYS ? previousStreak + 1 : 1;
}

/**
 * A founder enters a negative streak after two full weeks without a check-in.
 * Each additional full week decreases the displayed streak by one more.
 */
export function computeCurrentStreak(
	previousStreak: number,
	lastCheckInAt: Date | null,
	now: Date
): number {
	if (!lastCheckInAt) {
		return previousStreak;
	}

	const weeksWithoutCheckIn = Math.floor(
		(now.getTime() - lastCheckInAt.getTime()) / ONE_WEEK_MS
	);
	return weeksWithoutCheckIn >= 2 ? 1 - weeksWithoutCheckIn : previousStreak;
}
