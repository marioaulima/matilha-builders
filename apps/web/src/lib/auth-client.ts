import type { auth } from "@matilha-builders/auth";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/svelte";

export const authClient = createAuthClient({
	plugins: [inferAdditionalFields<typeof auth>()],
});
