<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";

	const sessionQuery = authClient.useSession();

	$effect(() => {
		if ($sessionQuery.isPending) {
			return;
		}
		goto($sessionQuery.data ? "/board" : "/login");
	});
</script>

<div
	class="flex h-full items-center justify-center text-sm text-muted-foreground"
>
	Carregando...
</div>
