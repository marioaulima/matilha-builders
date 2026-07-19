const GRACE_DAYS = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ONE_WEEK_MS = 7 * MS_PER_DAY;

/**
 * Weekly check-in cadence with slack: a check-in within GRACE_DAYS after the
 * current week continues the streak; a longer gap resets it to 1. Multiple
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
	return diffDays <= 7 + GRACE_DAYS ? previousStreak + 1 : 1;
}
