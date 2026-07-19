import { createContext } from "@matilha-builders/api/context";
import { appRouter } from "@matilha-builders/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { RequestHandler } from "@sveltejs/kit";

const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

const apiHandler = new OpenAPIHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
});

const handle: RequestHandler = async ({ request }) => {
	const context = await createContext({
		headers: request.headers,
	});

	const rpcResult = await rpcHandler.handle(request, {
		context,
		prefix: "/rpc",
	});
	if (rpcResult.response) {
		return rpcResult.response;
	}

	const apiResult = await apiHandler.handle(request, {
		context,
		prefix: "/rpc/api-reference",
	});
	if (apiResult.response) {
		return apiResult.response;
	}

	return new Response("Not found", { status: 404 });
};

export const HEAD = handle;
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
