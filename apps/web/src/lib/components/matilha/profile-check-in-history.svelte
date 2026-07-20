<script lang="ts">
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import {
		Collapsible,
		CollapsibleContent,
		CollapsibleTrigger,
	} from "$lib/components/ui/collapsible/index.js";
	import CheckInItem from "./check-in-item.svelte";
	import InfiniteScrollSentinel from "./infinite-scroll-sentinel.svelte";

	interface Product {
		id: string;
		imageUrl: string | null;
		link: string | null;
		name: string;
		status: "validating" | "building" | "launched";
	}

	interface CheckIn {
		blocked: string;
		createdAt: string | Date;
		help: string | null;
		id: string;
		product: Product | null;
		progress: string;
	}

	let {
		history,
		founderName,
		hasNextPage,
		isFetchingNextPage,
		onLoadMore,
		open = $bindable(false),
	}: {
		history: CheckIn[];
		founderName: string;
		hasNextPage: boolean;
		isFetchingNextPage: boolean;
		onLoadMore: () => void;
		open?: boolean;
	} = $props();
</script>

<Collapsible bind:open>
	<CollapsibleTrigger
		class="group flex w-full cursor-pointer items-center justify-between rounded-lg py-1 text-left"
	>
		<p
			class="font-mono text-[13px] text-muted-foreground transition-colors group-hover:text-foreground"
		>
			{history.length}
			{history.length === 1 ? "check-in" : "check-ins"}
			· olha quanto já andou
		</p>
		<ChevronDownIcon
			class="size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
		/>
	</CollapsibleTrigger>
	<CollapsibleContent
		class="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
	>
		<div class="flex flex-col gap-3 pt-3">
			{#if history.length}
				{#each history as checkIn, index (checkIn.id)}
					<CheckInItem
						checkIn={{ ...checkIn, name: founderName }}
						{index}
						showAuthor={false}
					/>
				{/each}
				<InfiniteScrollSentinel
					{hasNextPage}
					{isFetchingNextPage}
					{onLoadMore}
				/>
			{:else}
				<p class="text-sm text-muted-foreground">
					Nenhum check-in ainda. Começa essa semana.
				</p>
			{/if}
		</div>
	</CollapsibleContent>
</Collapsible>
