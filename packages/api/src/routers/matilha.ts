import { db } from "@matilha-builders/db";
import { user } from "@matilha-builders/db/schema/auth";
import { checkIn, founderProfile } from "@matilha-builders/db/schema/matilha";
import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { pickSpotlightId } from "../lib/feed";
import { computeNextStreak } from "../lib/streak";

const founderColumns = {
	avatarUrl: founderProfile.avatarUrl,
	lastCheckInAt: founderProfile.lastCheckInAt,
	link: founderProfile.link,
	name: user.name,
	product: founderProfile.product,
	productImageUrl: founderProfile.productImageUrl,
	status: founderProfile.status,
	streak: founderProfile.streak,
	userId: founderProfile.userId,
};

export const matilhaRouter = {
	checkIns: {
		create: protectedProcedure
			.input(
				z.object({
					blocked: z.string().min(1),
					help: z.string().optional(),
					progress: z.string().min(1),
				})
			)
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				const [profile] = await db
					.select({
						lastCheckInAt: founderProfile.lastCheckInAt,
						streak: founderProfile.streak,
					})
					.from(founderProfile)
					.where(eq(founderProfile.userId, founderId))
					.limit(1);
				const now = new Date();
				const nextStreak = computeNextStreak(
					profile?.streak ?? 0,
					profile?.lastCheckInAt ?? null,
					now
				);
				await db.insert(checkIn).values({
					blocked: input.blocked,
					founderId,
					help: input.help,
					progress: input.progress,
				});
				await db
					.update(founderProfile)
					.set({ lastCheckInAt: now, streak: nextStreak })
					.where(eq(founderProfile.userId, founderId));
				return { streak: nextStreak };
			}),
		listByFounder: protectedProcedure
			.input(z.object({ founderId: z.string() }))
			.handler(async ({ input }) =>
				db
					.select()
					.from(checkIn)
					.where(eq(checkIn.founderId, input.founderId))
					.orderBy(desc(checkIn.createdAt))
			),
		listFeed: protectedProcedure.handler(async () => {
			const rows = await db
				.select({
					avatarUrl: founderProfile.avatarUrl,
					blocked: checkIn.blocked,
					createdAt: checkIn.createdAt,
					founderId: checkIn.founderId,
					help: checkIn.help,
					id: checkIn.id,
					name: user.name,
					product: founderProfile.product,
					progress: checkIn.progress,
					streak: founderProfile.streak,
				})
				.from(checkIn)
				.innerJoin(user, eq(user.id, checkIn.founderId))
				.innerJoin(founderProfile, eq(founderProfile.userId, checkIn.founderId))
				.orderBy(desc(checkIn.createdAt))
				.limit(50);
			const spotlightId = pickSpotlightId(rows, new Date());
			return rows.map((row) => ({ ...row, featured: row.id === spotlightId }));
		}),
	},
	founders: {
		get: protectedProcedure
			.input(z.object({ founderId: z.string() }))
			.handler(async ({ input }) => {
				const [row] = await db
					.select(founderColumns)
					.from(founderProfile)
					.innerJoin(user, eq(user.id, founderProfile.userId))
					.where(eq(founderProfile.userId, input.founderId))
					.limit(1);
				if (!row) {
					throw new ORPCError("NOT_FOUND");
				}
				return row;
			}),
		list: protectedProcedure.handler(async () =>
			db
				.select(founderColumns)
				.from(founderProfile)
				.innerJoin(user, eq(user.id, founderProfile.userId))
				.orderBy(desc(founderProfile.lastCheckInAt))
		),
	},
};
