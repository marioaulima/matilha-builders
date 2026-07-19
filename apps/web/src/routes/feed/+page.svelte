<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import CheckInItem from "$lib/components/matilha/CheckInItem.svelte";
	import { Loader } from "$lib/components/ui/loader/index.js";
	import { orpc } from "$lib/orpc";

	const feedQuery = createQuery(() => orpc.checkIns.listFeed.queryOptions());
</script>

<div class="mx-auto max-w-4xl px-4 py-8 md:px-6">
	<div class="mb-6 border-border border-b pb-5">
		<h1 class="text-2xl font-bold tracking-tight">Feed</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Os wins e os fails de todo mundo
		</p>
	</div>
	{#if feedQuery.isLoading}
		<Loader
			size="sm"
			subtitle="Buscando os últimos check-ins"
			title="Carregando o feed..."
		/>
	{:else if !feedQuery.data?.length}
		<p class="text-sm text-muted-foreground">
			Ninguém postou ainda essa semana. Começa tu.
		</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each feedQuery.data as checkIn, index (checkIn.id)}
				<CheckInItem {checkIn} {index} />
			{/each}
		</div>
	{/if}
</div>
