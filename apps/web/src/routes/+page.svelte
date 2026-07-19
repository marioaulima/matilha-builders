<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { Loader } from "$lib/components/ui/loader/index.js";

	const sessionQuery = authClient.useSession();

	$effect(() => {
		if ($sessionQuery.isPending) {
			return;
		}
		goto($sessionQuery.data ? "/board" : "/login");
	});
</script>

<div class="flex h-full items-center justify-center">
	<Loader size="sm" subtitle="Só um instante" title="Carregando a matilha..." />
</div>
