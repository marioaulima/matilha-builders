const GRACE_DAYS = 10;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Weekly check-in cadence with slack: a check-in within GRACE_DAYS of the
 * last one continues the streak; a longer gap resets it to 1.
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
	return diffDays <= GRACE_DAYS ? previousStreak + 1 : 1;
}
