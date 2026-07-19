<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import CheckInItem from "$lib/components/matilha/CheckInItem.svelte";
	import { orpc } from "$lib/orpc";

	const feedQuery = createQuery(() => orpc.checkIns.listFeed.queryOptions());
</script>

<div class="mx-auto max-w-2xl px-4 py-6">
	<h1 class="mb-1 text-2xl font-bold">Feed</h1>
	<p class="mb-5 text-sm text-muted-foreground">
		Os wins e os fails de todo mundo
	</p>
	{#if feedQuery.isLoading}
		<p class="text-sm text-muted-foreground">Carregando...</p>
	{:else if !feedQuery.data?.length}
		<p class="text-sm text-muted-foreground">
			Ninguém postou ainda essa semana. Começa tu.
		</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each feedQuery.data as checkIn (checkIn.id)}
				<CheckInItem {checkIn} />
			{/each}
		</div>
	{/if}
</div>
