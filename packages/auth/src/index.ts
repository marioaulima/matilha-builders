import { createDb } from "@matilha-builders/db";
import * as schema from "@matilha-builders/db/schema/auth";
import { founder } from "@matilha-builders/db/schema/matilha";
import { env } from "@matilha-builders/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export function createAuth() {
	const db = createDb();

	return betterAuth({
		baseURL: env.BETTER_AUTH_URL,
		database: drizzleAdapter(db, {
			provider: "pg",

			schema,
		}),
		databaseHooks: {
			user: {
				create: {
					after: async (user) => {
						await db.insert(founder).values({
							userId: user.id,
						});
					},
				},
			},
		},
		emailAndPassword: {
			enabled: true,
		},
		plugins: [],
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: [env.CORS_ORIGIN],
	});
}

export const auth = createAuth();
