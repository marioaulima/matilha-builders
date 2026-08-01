/**
 * Recomputes every founder's stored streak from their check-in history.
 *
 * Needed once after the streak rules moved from a rolling 7-day gap to
 * Monday-anchored calendar weeks: streaks written under the old rule are stuck
 * at 1 for anyone who checked in more than once in the same week.
 *
 * Usage (from packages/api):
 *   pnpm backfill:streaks --dry-run
 *   pnpm backfill:streaks
 */
import dotenv from "dotenv";

dotenv.config({ path: "../../apps/web/.env" });

const { db } = await import("@matilha-builders/db");
const { user } = await import("@matilha-builders/db/schema/auth");
const { checkIn, founder } = await import(
	"@matilha-builders/db/schema/matilha"
);
const { asc, eq, isNull } = await import("drizzle-orm");
const { computeNextStreak } = await import("../src/lib/streak");

const isDryRun = process.argv.includes("--dry-run");

const founders = await db
	.select({
		name: user.name,
		storedStreak: founder.streak,
		userId: founder.userId,
	})
	.from(founder)
	.innerJoin(user, eq(user.id, founder.userId))
	.orderBy(asc(user.name));

const checkIns = await db
	.select({ createdAt: checkIn.createdAt, founderId: checkIn.founderId })
	.from(checkIn)
	.where(isNull(checkIn.dismissedAt))
	.orderBy(asc(checkIn.createdAt));

const historyByFounder = new Map<string, Date[]>();
for (const entry of checkIns) {
	const history = historyByFounder.get(entry.founderId) ?? [];
	history.push(entry.createdAt);
	historyByFounder.set(entry.founderId, history);
}

const updates: {
	lastCheckInAt: Date | null;
	streak: number;
	userId: string;
}[] = [];

for (const row of founders) {
	const history = historyByFounder.get(row.userId) ?? [];

	let streak = 0;
	let lastCheckInAt: Date | null = null;
	for (const createdAt of history) {
		streak = computeNextStreak(streak, lastCheckInAt, createdAt);
		lastCheckInAt = createdAt;
	}

	if (streak === row.storedStreak) {
		continue;
	}

	updates.push({ lastCheckInAt, streak, userId: row.userId });
	process.stdout.write(
		`${row.name}: ${row.storedStreak} -> ${streak} (${history.length} check-ins)\n`
	);
}

if (!isDryRun) {
	await Promise.all(
		updates.map((update) =>
			db
				.update(founder)
				.set({ lastCheckInAt: update.lastCheckInAt, streak: update.streak })
				.where(eq(founder.userId, update.userId))
		)
	);
}

process.stdout.write(
	isDryRun
		? `\nDry run: ${updates.length} of ${founders.length} founders would change.\n`
		: `\nUpdated ${updates.length} of ${founders.length} founders.\n`
);
