import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

const MAX_STREAK_GAP_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ONE_WEEK_MS = 7 * MS_PER_DAY;

/**
 * A check-in stays editable through its own week and the next one — the same
 * two-week slack the streak allows — after which it's locked.
 */
export const EDIT_WINDOW_MS = 2 * ONE_WEEK_MS;

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

/**
 * SQL mirror of computeCurrentStreak, for ORDER BY on the decayed streak
 * value instead of the raw stored column.
 */
export function currentStreakSql(
	streakColumn: AnyPgColumn,
	lastCheckInColumn: AnyPgColumn,
	now: Date
): SQL<number> {
	const weeksWithoutCheckIn = sql`floor(extract(epoch from (${now}::timestamptz - ${lastCheckInColumn})) / ${ONE_WEEK_MS / 1000})`;
	return sql<number>`
		case
			when ${lastCheckInColumn} is null then ${streakColumn}
			when ${weeksWithoutCheckIn} >= 2 then 1 - (${weeksWithoutCheckIn})::int
			else ${streakColumn}
		end
	`;
}
