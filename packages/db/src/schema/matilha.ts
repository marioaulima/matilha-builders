import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";

export const founderStatusEnum = pgEnum("founder_status", [
	"validating",
	"building",
	"launched",
]);

export const founderProfile = pgTable("founder_profile", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	lastCheckInAt: timestamp("last_check_in_at"),
	link: text("link"),
	product: text("product").notNull(),
	status: founderStatusEnum("status").default("validating").notNull(),
	streak: integer("streak").default(0).notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const checkIn = pgTable("check_in", {
	blocked: text("blocked").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	founderId: text("founder_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	help: text("help"),
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	progress: text("progress").notNull(),
});

export const founderProfileRelations = relations(
	founderProfile,
	({ one, many }) => ({
		checkIns: many(checkIn),
		user: one(user, {
			fields: [founderProfile.userId],
			references: [user.id],
		}),
	})
);

export const checkInRelations = relations(checkIn, ({ one }) => ({
	founder: one(user, {
		fields: [checkIn.founderId],
		references: [user.id],
	}),
}));
