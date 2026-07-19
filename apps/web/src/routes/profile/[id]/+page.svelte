<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { page } from "$app/state";
	import CheckInItem from "$lib/components/matilha/CheckInItem.svelte";
	import StatusBadge from "$lib/components/matilha/StatusBadge.svelte";
	import StreakBadge from "$lib/components/matilha/StreakBadge.svelte";
	import { orpc } from "$lib/orpc";

	const founderId = $derived(page.params.id ?? "");
	const founderQuery = createQuery(() =>
		orpc.founders.get.queryOptions({ input: { founderId } })
	);
	const historyQuery = createQuery(() =>
		orpc.checkIns.listByFounder.queryOptions({ input: { founderId } })
	);
</script>

{#if founderQuery.data}
	{@const founder = founderQuery.data}
	<div class="mx-auto max-w-2xl px-4 py-6">
		<div class="mb-5 flex items-start justify-between">
			<div>
				<h1 class="text-2xl font-bold">{founder.name}</h1>
				<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
					{founder.product}
					<StatusBadge status={founder.status} />
				</div>
			</div>
			<StreakBadge weeks={founder.streak} />
		</div>
		<p class="mb-3 font-mono text-[13px] text-muted-foreground">
			{historyQuery.data?.length ?? 0}
			{historyQuery.data?.length === 1 ? "check-in" : "check-ins"}
			· olha quanto já andou
		</p>
		<div class="flex flex-col gap-3">
			{#if historyQuery.data?.length}
				{#each historyQuery.data as ci, index (ci.id)}
					<CheckInItem
						checkIn={{ ...ci, name: founder.name, product: founder.product }}
						{index}
						showAuthor={false}
					/>
				{/each}
			{:else}
				<p class="text-sm text-muted-foreground">
					Nenhum check-in ainda. Começa essa semana.
				</p>
			{/if}
		</div>
	</div>
{/if}
