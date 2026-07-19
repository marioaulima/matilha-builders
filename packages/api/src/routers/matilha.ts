import { db } from "@matilha-builders/db";
import { checkIn, founder, product } from "@matilha-builders/db/schema/matilha";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, isNotNull, max } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";
import { MAX_PRODUCTS_PER_FOUNDER, PAGE_SIZE } from "../lib/constants";
import { computeNextStreak, ONE_WEEK_MS } from "../lib/streak";

function paginate<T>(items: T[], cursor: number) {
	return {
		items,
		nextCursor: items.length === PAGE_SIZE ? cursor + PAGE_SIZE : undefined,
	};
}

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
					const [lastForProduct] = await db
						.select({ createdAt: checkIn.createdAt })
						.from(checkIn)
						.where(
							and(
								eq(checkIn.founderId, founderId),
								eq(checkIn.productId, input.productId)
							)
						)
						.orderBy(desc(checkIn.createdAt))
						.limit(1);
					if (
						lastForProduct &&
						Date.now() - lastForProduct.createdAt.getTime() < ONE_WEEK_MS
					) {
						throw new ORPCError("BAD_REQUEST", {
							message:
								"Esse produto já recebeu um check-in essa semana. Espera a semana que vem.",
						});
					}
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
			.input(
				z.object({
					cursor: z.number().int().min(0).optional(),
					founderId: z.string(),
				})
			)
			.handler(async ({ input }) => {
				const cursor = input.cursor ?? 0;
				const rows = await db.query.checkIn.findMany({
					limit: PAGE_SIZE,
					offset: cursor,
					orderBy: desc(checkIn.createdAt),
					where: eq(checkIn.founderId, input.founderId),
					with: { product: true },
				});
				return paginate(rows, cursor);
			}),
		listFeed: protectedProcedure
			.input(
				z.object({ cursor: z.number().int().min(0).optional() }).optional()
			)
			.handler(async ({ input }) => {
				const cursor = input?.cursor ?? 0;
				const rows = await db.query.checkIn.findMany({
					limit: PAGE_SIZE,
					offset: cursor,
					orderBy: desc(checkIn.createdAt),
					with: {
						founder: { with: { user: true } },
						product: true,
					},
				});
				const items = rows.map((row) => ({
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
				return paginate(items, cursor);
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
					bio: row.bio,
					featuredProductId: row.featuredProductId,
					lastCheckInAt: row.lastCheckInAt,
					name: row.user.name,
					products: withFeaturedFirst(row.products, row.featuredProductId),
					streak: row.streak,
					userId: row.userId,
				};
			}),
		list: protectedProcedure
			.input(
				z.object({ cursor: z.number().int().min(0).optional() }).optional()
			)
			.handler(async ({ input }) => {
				const cursor = input?.cursor ?? 0;
				const rows = await db.query.founder.findMany({
					limit: PAGE_SIZE,
					offset: cursor,
					orderBy: desc(founder.lastCheckInAt),
					with: {
						products: { orderBy: desc(product.createdAt) },
						user: true,
					},
				});
				const items = rows.map((row) => ({
					avatarUrl: row.avatarUrl,
					bio: row.bio,
					featuredProductId: row.featuredProductId,
					lastCheckInAt: row.lastCheckInAt,
					name: row.user.name,
					products: withFeaturedFirst(row.products, row.featuredProductId),
					streak: row.streak,
					userId: row.userId,
				}));
				return paginate(items, cursor);
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
		updateBio: protectedProcedure
			.input(z.object({ bio: z.string() }))
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				await db
					.update(founder)
					.set({ bio: input.bio || null })
					.where(eq(founder.userId, founderId));
				return { bio: input.bio || null };
			}),
		updateSignupDetails: protectedProcedure
			.input(
				z.object({
					interest: z.enum(["running", "building", "observing"]),
					phone: z.string().min(1),
				})
			)
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				await db
					.update(founder)
					.set({ interest: input.interest, phone: input.phone })
					.where(eq(founder.userId, founderId));
				return { interest: input.interest, phone: input.phone };
			}),
	},
	products: {
		create: protectedProcedure
			.input(
				z.object({
					icp: z.string().optional(),
					link: z.string().url().optional().or(z.literal("")),
					name: z.string().min(1),
					painPoint: z.string().optional(),
					solution: z.string().optional(),
				})
			)
			.handler(async ({ input, context }) => {
				const founderId = context.session.user.id;
				const existing = await db
					.select({ id: product.id })
					.from(product)
					.where(eq(product.founderId, founderId));
				if (existing.length >= MAX_PRODUCTS_PER_FOUNDER) {
					throw new ORPCError("BAD_REQUEST", {
						message: `Você já atingiu o limite de ${MAX_PRODUCTS_PER_FOUNDER} produtos.`,
					});
				}
				const [row] = await db
					.insert(product)
					.values({
						founderId,
						icp: input.icp || undefined,
						link: input.link || undefined,
						name: input.name,
						painPoint: input.painPoint || undefined,
						solution: input.solution || undefined,
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
		mine: protectedProcedure.handler(async ({ context }) => {
			const founderId = context.session.user.id;
			const products = await db
				.select()
				.from(product)
				.where(eq(product.founderId, founderId))
				.orderBy(desc(product.createdAt));
			const lastCheckIns = await db
				.select({
					lastAt: max(checkIn.createdAt),
					productId: checkIn.productId,
				})
				.from(checkIn)
				.where(
					and(eq(checkIn.founderId, founderId), isNotNull(checkIn.productId))
				)
				.groupBy(checkIn.productId);
			const lockStart = new Map(
				lastCheckIns
					.filter(
						(row): row is { lastAt: Date; productId: string } =>
							!!row.productId && !!row.lastAt
					)
					.map((row) => [row.productId, row.lastAt])
			);
			const now = Date.now();
			return products.map((p) => {
				const lastAt = lockStart.get(p.id);
				const checkInLockedUntil =
					lastAt && now - lastAt.getTime() < ONE_WEEK_MS
						? new Date(lastAt.getTime() + ONE_WEEK_MS)
						: null;
				return { ...p, checkInLockedUntil };
			});
		}),
		update: protectedProcedure
			.input(
				z.object({
					icp: z.string().optional(),
					id: z.string(),
					link: z.string().url().optional().or(z.literal("")),
					name: z.string().min(1).optional(),
					painPoint: z.string().optional(),
					solution: z.string().optional(),
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
