import { relations } from "drizzle-orm";
import {
	type AnyPgColumn,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const productStatusEnum = pgEnum("product_status", [
	"validating",
	"building",
	"launched",
]);

export const founder = pgTable("founder", {
	avatarUrl: text("avatar_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	featuredProductId: text("featured_product_id").references(
		(): AnyPgColumn => product.id,
		{ onDelete: "set null" }
	),
	lastCheckInAt: timestamp("last_check_in_at"),
	streak: integer("streak").default(0).notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	userId: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const product = pgTable("product", {
	createdAt: timestamp("created_at").defaultNow().notNull(),
	founderId: text("founder_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	imageUrl: text("image_url"),
	link: text("link"),
	name: text("name").notNull(),
	status: productStatusEnum("status").default("validating").notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
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
	productId: text("product_id").references(() => product.id, {
		onDelete: "set null",
	}),
	progress: text("progress").notNull(),
});

export const founderRelations = relations(founder, ({ one, many }) => ({
	checkIns: many(checkIn),
	products: many(product),
	user: one(user, {
		fields: [founder.userId],
		references: [user.id],
	}),
}));

export const productRelations = relations(product, ({ one, many }) => ({
	checkIns: many(checkIn),
	founder: one(founder, {
		fields: [product.founderId],
		references: [founder.userId],
	}),
}));

export const checkInRelations = relations(checkIn, ({ one }) => ({
	founder: one(founder, {
		fields: [checkIn.founderId],
		references: [founder.userId],
	}),
	product: one(product, {
		fields: [checkIn.productId],
		references: [product.id],
	}),
}));
