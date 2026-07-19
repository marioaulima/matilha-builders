<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import FounderCard from "$lib/components/matilha/FounderCard.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Loader } from "$lib/components/ui/loader/index.js";
	import { orpc } from "$lib/orpc";

	const foundersQuery = createQuery(() => orpc.founders.list.queryOptions());
</script>

<div class="mx-auto max-w-4xl px-4 py-8 md:px-6">
	<div
		class="mb-6 flex items-end justify-between gap-4 border-border border-b pb-5"
	>
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Board</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Quem tá construindo o quê
			</p>
		</div>
		<Button href="/checkin">Postar check-in</Button>
	</div>
	{#if foundersQuery.isLoading}
		<Loader
			size="sm"
			subtitle="Buscando quem tá construindo"
			title="Carregando o board..."
		/>
	{:else if !foundersQuery.data?.length}
		<p class="text-sm text-muted-foreground">Ninguém na matilha ainda.</p>
	{:else}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
			{#each foundersQuery.data as founder, index (founder.userId)}
				<FounderCard {founder} {index} />
			{/each}
		</div>
	{/if}
</div>
