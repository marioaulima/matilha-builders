import { auth } from "@matilha-builders/auth";
import { db } from "@matilha-builders/db";
import { founder, product } from "@matilha-builders/db/schema/matilha";
import { UploadThingError } from "@uploadthing/shared";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing();

async function requireSession(req: Request) {
	const session = await auth.api.getSession({ headers: req.headers });
	if (!session) {
		throw new UploadThingError("Unauthorized");
	}
	return { userId: session.user.id };
}

export const uploadRouter = {
	avatarUploader: f({ image: { maxFileCount: 1, maxFileSize: "2MB" } })
		.middleware(({ req }) => requireSession(req))
		.onUploadComplete(async ({ file, metadata }) => {
			await db
				.update(founder)
				.set({ avatarUrl: file.ufsUrl })
				.where(eq(founder.userId, metadata.userId));
			return { url: file.ufsUrl };
		}),
	productImageUploader: f({ image: { maxFileCount: 1, maxFileSize: "4MB" } })
		.input(z.object({ productId: z.string() }))
		.middleware(async ({ req, input }) => {
			const { userId } = await requireSession(req);
			return { productId: input.productId, userId };
		})
		.onUploadComplete(async ({ file, metadata }) => {
			await db
				.update(product)
				.set({ imageUrl: file.ufsUrl })
				.where(
					and(
						eq(product.id, metadata.productId),
						eq(product.founderId, metadata.userId)
					)
				);
			return { url: file.ufsUrl };
		}),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
