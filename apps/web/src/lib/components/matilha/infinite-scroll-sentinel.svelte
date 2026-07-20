<script lang="ts">
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";

	let {
		hasNextPage,
		isFetchingNextPage,
		onLoadMore,
	}: {
		hasNextPage: boolean;
		isFetchingNextPage: boolean;
		onLoadMore: () => void;
	} = $props();

	let sentinel: HTMLDivElement | undefined = $state();

	$effect(() => {
		if (!(sentinel && hasNextPage)) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					onLoadMore();
				}
			},
			{ rootMargin: "200px" }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

{#if hasNextPage}
	<div class="flex justify-center py-6" bind:this={sentinel}>
		{#if isFetchingNextPage}
			<LoaderCircleIcon class="size-5 animate-spin text-muted-foreground" />
		{/if}
	</div>
{/if}
