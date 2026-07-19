import { auth } from "@matilha-builders/auth";
import { db } from "@matilha-builders/db";
import { founderProfile } from "@matilha-builders/db/schema/matilha";
import { eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/server";
import { UploadThingError } from "@uploadthing/shared";

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
				.update(founderProfile)
				.set({ avatarUrl: file.ufsUrl })
				.where(eq(founderProfile.userId, metadata.userId));
			return { url: file.ufsUrl };
		}),
	productImageUploader: f({ image: { maxFileCount: 1, maxFileSize: "4MB" } })
		.middleware(({ req }) => requireSession(req))
		.onUploadComplete(async ({ file, metadata }) => {
			await db
				.update(founderProfile)
				.set({ productImageUrl: file.ufsUrl })
				.where(eq(founderProfile.userId, metadata.userId));
			return { url: file.ufsUrl };
		}),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
