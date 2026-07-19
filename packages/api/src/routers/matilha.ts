import { db } from "@matilha-builders/db";
import { checkIn, founder, product } from "@matilha-builders/db/schema/matilha";
import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { pickSpotlightId } from "../lib/feed";
import { computeNextStreak } from "../lib/streak";

async function requireOwnedProduct(productId: string, founderId: string) {
	const [row] = await db
		.select({ founderId: product.founderId })
		.from(product)
		.where(eq(product.id, productId))
		.limit(1);
	if (!row || row.founderId !== founderId) {
		throw new ORPCError("NOT_FOUND");
	}
}

function withFeaturedFirst<T extends { id: string }>(
	products: T[],
	featuredProductId: string | null
): T[] {
	if (!featuredProductId) {
		return products;
	}
	const featuredIndex = products.findIndex((p) => p.id === featuredProductId);
	if (featuredIndex <= 0) {
		return products;
	}
	return [
		products[featuredIndex] as T,
		...products.filter((_, i) => i !== featuredIndex),
	];
}

export const matilhaRouter = {
	checkIns: {
		create: protectedProcedure
			.input(
				z.object({
					blocked: z.string().min(1),
					help: z.string().optional(),
					productId: z.string().optional(),
					progress: z.string().min(1),
				})
			)
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				if (input.productId) {
					await requireOwnedProduct(input.productId, founderId);
				}
				const [profile] = await db
					.select({
						lastCheckInAt: founder.lastCheckInAt,
						streak: founder.streak,
					})
					.from(founder)
					.where(eq(founder.userId, founderId))
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
					productId: input.productId,
					progress: input.progress,
				});
				await db
					.update(founder)
					.set({ lastCheckInAt: now, streak: nextStreak })
					.where(eq(founder.userId, founderId));
				return { streak: nextStreak };
			}),
		listByFounder: protectedProcedure
			.input(z.object({ founderId: z.string() }))
			.handler(async ({ input }) =>
				db.query.checkIn.findMany({
					orderBy: desc(checkIn.createdAt),
					where: eq(checkIn.founderId, input.founderId),
					with: { product: true },
				})
			),
		listFeed: protectedProcedure.handler(async () => {
			const rows = await db.query.checkIn.findMany({
				limit: 50,
				orderBy: desc(checkIn.createdAt),
				with: {
					founder: { with: { user: true } },
					product: true,
				},
			});
			const withStreak = rows.map((row) => ({
				avatarUrl: row.founder.avatarUrl,
				blocked: row.blocked,
				createdAt: row.createdAt,
				founderId: row.founderId,
				help: row.help,
				id: row.id,
				name: row.founder.user.name,
				product: row.product,
				progress: row.progress,
				streak: row.founder.streak,
			}));
			const spotlightId = pickSpotlightId(withStreak, new Date());
			return withStreak.map((row) => ({
				...row,
				featured: row.id === spotlightId,
			}));
		}),
	},
	founders: {
		get: protectedProcedure
			.input(z.object({ founderId: z.string() }))
			.handler(async ({ input }) => {
				const row = await db.query.founder.findFirst({
					where: eq(founder.userId, input.founderId),
					with: {
						products: { orderBy: desc(product.createdAt) },
						user: true,
					},
				});
				if (!row) {
					throw new ORPCError("NOT_FOUND");
				}
				return {
					avatarUrl: row.avatarUrl,
					featuredProductId: row.featuredProductId,
					lastCheckInAt: row.lastCheckInAt,
					name: row.user.name,
					products: withFeaturedFirst(row.products, row.featuredProductId),
					streak: row.streak,
					userId: row.userId,
				};
			}),
		list: protectedProcedure.handler(async () => {
			const rows = await db.query.founder.findMany({
				orderBy: desc(founder.lastCheckInAt),
				with: {
					products: { orderBy: desc(product.createdAt) },
					user: true,
				},
			});
			return rows.map((row) => ({
				avatarUrl: row.avatarUrl,
				featuredProductId: row.featuredProductId,
				lastCheckInAt: row.lastCheckInAt,
				name: row.user.name,
				products: withFeaturedFirst(row.products, row.featuredProductId),
				streak: row.streak,
				userId: row.userId,
			}));
		}),
		setFeaturedProduct: protectedProcedure
			.input(z.object({ productId: z.string().nullable() }))
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				if (input.productId) {
					await requireOwnedProduct(input.productId, founderId);
				}
				await db
					.update(founder)
					.set({ featuredProductId: input.productId })
					.where(eq(founder.userId, founderId));
				return { featuredProductId: input.productId };
			}),
	},
	products: {
		create: protectedProcedure
			.input(
				z.object({
					link: z.string().url().optional().or(z.literal("")),
					name: z.string().min(1),
				})
			)
			.handler(async ({ input, context }) => {
				const [row] = await db
					.insert(product)
					.values({
						founderId: context.session.user.id,
						link: input.link || undefined,
						name: input.name,
					})
					.returning();
				return row;
			}),
		delete: protectedProcedure
			.input(z.object({ id: z.string() }))
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				const [row] = await db
					.delete(product)
					.where(
						and(eq(product.id, input.id), eq(product.founderId, founderId))
					)
					.returning();
				if (!row) {
					throw new ORPCError("NOT_FOUND");
				}
				return { id: row.id };
			}),
		mine: protectedProcedure.handler(async ({ context }) =>
			db
				.select()
				.from(product)
				.where(eq(product.founderId, context.session.user.id))
				.orderBy(desc(product.createdAt))
		),
		update: protectedProcedure
			.input(
				z.object({
					id: z.string(),
					link: z.string().url().optional().or(z.literal("")),
					name: z.string().min(1).optional(),
					status: z.enum(["validating", "building", "launched"]).optional(),
				})
			)
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				const { id, ...patch } = input;
				const [row] = await db
					.update(product)
					.set({
						...patch,
						link: patch.link === "" ? null : patch.link,
					})
					.where(and(eq(product.id, id), eq(product.founderId, founderId)))
					.returning();
				if (!row) {
					throw new ORPCError("NOT_FOUND");
				}
				return row;
			}),
	},
};
