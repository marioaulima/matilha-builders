import { db } from "@matilha-builders/db";
import { user } from "@matilha-builders/db/schema/auth";
import { founder } from "@matilha-builders/db/schema/matilha";
import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure } from "../index";

function requireSuperAdmin(role: string) {
	if (role !== "super_admin") {
		throw new ORPCError("FORBIDDEN");
	}
}

export const adminRouter = {
	admin: {
		approveUser: protectedProcedure
			.input(z.object({ userId: z.string() }))
			.handler(async ({ input, context }) => {
				requireSuperAdmin(context.session.user.role);
				await db
					.update(user)
					.set({ approvalStatus: "approved" })
					.where(eq(user.id, input.userId));
				return { approvalStatus: "approved" as const };
			}),
		listPendingUsers: protectedProcedure.handler(async ({ context }) => {
			requireSuperAdmin(context.session.user.role);
			const rows = await db
				.select({
					createdAt: user.createdAt,
					email: user.email,
					interest: founder.interest,
					name: user.name,
					phone: founder.phone,
					userId: user.id,
				})
				.from(user)
				.innerJoin(founder, eq(founder.userId, user.id))
				.where(eq(user.approvalStatus, "pending"))
				.orderBy(desc(user.createdAt));
			return rows;
		}),
		rejectUser: protectedProcedure
			.input(z.object({ userId: z.string() }))
			.handler(async ({ input, context }) => {
				requireSuperAdmin(context.session.user.role);
				await db
					.update(user)
					.set({ approvalStatus: "rejected" })
					.where(eq(user.id, input.userId));
				return { approvalStatus: "rejected" as const };
			}),
	},
};
