<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { page } from "$app/state";
	import { authClient } from "$lib/auth-client";
	import Avatar from "$lib/components/matilha/Avatar.svelte";
	import CheckInItem from "$lib/components/matilha/CheckInItem.svelte";
	import ImageUploadButton from "$lib/components/matilha/ImageUploadButton.svelte";
	import StatusBadge from "$lib/components/matilha/StatusBadge.svelte";
	import StreakBadge from "$lib/components/matilha/StreakBadge.svelte";
	import { orpc } from "$lib/orpc";

	const founderId = $derived(page.params.id ?? "");
	const sessionQuery = authClient.useSession();
	const isOwnProfile = $derived($sessionQuery.data?.user.id === founderId);
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
			<div class="flex items-start gap-3">
				<Avatar name={founder.name} size="lg" src={founder.avatarUrl} />
				<div>
					<h1 class="text-2xl font-bold">{founder.name}</h1>
					<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
						{#if founder.productImageUrl}
							<img
								alt=""
								class="size-4 rounded object-cover"
								src={founder.productImageUrl}
							/>
						{/if}
						{founder.product}
						<StatusBadge status={founder.status} />
					</div>
					{#if isOwnProfile}
						<div class="mt-3 flex gap-2">
							<ImageUploadButton
								endpoint="avatarUploader"
								label="Trocar foto"
								onUploaded={() => founderQuery.refetch()}
							/>
							<ImageUploadButton
								endpoint="productImageUploader"
								label="Foto do produto"
								onUploaded={() => founderQuery.refetch()}
							/>
						</div>
					{/if}
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
