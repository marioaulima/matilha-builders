import { env } from "@matilha-builders/env/server";
import { createRouteHandler } from "uploadthing/server";
import type { RequestHandler } from "@sveltejs/kit";

import { uploadRouter } from "$lib/server/uploadthing";

const handler = createRouteHandler({
	router: uploadRouter,
	config: { token: env.UPLOADTHING_TOKEN },
});

export const GET: RequestHandler = ({ request }) => handler(request);
export const POST: RequestHandler = ({ request }) => handler(request);
