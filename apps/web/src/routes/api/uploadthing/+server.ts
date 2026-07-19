import { env } from "@matilha-builders/env/server";
import type { RequestHandler } from "@sveltejs/kit";
import { createRouteHandler } from "uploadthing/server";

import { uploadRouter } from "$lib/server/uploadthing";

const handler = createRouteHandler({
	config: { token: env.UPLOADTHING_TOKEN },
	router: uploadRouter,
});

export const GET: RequestHandler = ({ request }) => handler(request);
export const POST: RequestHandler = ({ request }) => handler(request);
