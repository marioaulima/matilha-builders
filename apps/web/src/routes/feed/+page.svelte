<script lang="ts">
	import { createInfiniteQuery } from "@tanstack/svelte-query";
	import CheckInItem from "$lib/components/matilha/check-in-item.svelte";
	import InfiniteScrollSentinel from "$lib/components/matilha/infinite-scroll-sentinel.svelte";
	import { Loader } from "$lib/components/ui/loader/index.js";
	import { orpc } from "$lib/orpc";

	const feedQuery = createInfiniteQuery(() =>
		orpc.checkIns.listFeed.infiniteOptions({
			getNextPageParam: (lastPage) => lastPage.nextCursor,
			initialPageParam: 0,
			input: (cursor: number) => ({ cursor }),
		})
	);

	const checkIns = $derived(
		feedQuery.data?.pages.flatMap((page) => page.items) ?? []
	);
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
	{:else if !checkIns.length}
		<p class="text-sm text-muted-foreground">
			Ninguém postou ainda essa semana. Começa tu.
		</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each checkIns as checkIn, index (checkIn.id)}
				<CheckInItem {checkIn} {index} />
			{/each}
		</div>
		<InfiniteScrollSentinel
			hasNextPage={feedQuery.hasNextPage}
			isFetchingNextPage={feedQuery.isFetchingNextPage}
			onLoadMore={() => feedQuery.fetchNextPage()}
		/>
	{/if}
</div>
