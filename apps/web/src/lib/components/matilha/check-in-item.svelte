<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { formatRelative } from "$lib/format";
	import Avatar from "./avatar.svelte";
	import ProductChip from "./product-chip.svelte";

	type Product = {
		id: string;
		name: string;
		link: string | null;
		imageUrl: string | null;
		status: "validating" | "building" | "launched";
	};

	type CheckIn = {
		id: string;
		name: string;
		product: Product | null;
		progress: string;
		blocked: string;
		help: string | null;
		createdAt: string | Date;
		avatarUrl?: string | null;
	};

	let {
		checkIn,
		showAuthor = true,
		index = 0,
	}: { checkIn: CheckIn; showAuthor?: boolean; index?: number } = $props();
</script>

<motion.div
	animate={{ opacity: 1, y: 0 }}
	class="rounded-xl border border-border bg-card p-4"
	initial={{ opacity: 0, y: 6 }}
	transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
>
	<div class="mb-3 flex items-center justify-between gap-3">
		{#if showAuthor}
			<span class="flex items-center gap-2 text-sm font-semibold">
				<Avatar name={checkIn.name} size="sm" src={checkIn.avatarUrl} />
				{checkIn.name}
			</span>
			<span class="flex items-center gap-2">
				{#if checkIn.product}
					<ProductChip
						product={checkIn.product}
						showImage={false}
						variant="tag"
					/>
				{/if}
				<span class="font-mono text-xs text-muted-foreground"
					>{formatRelative(checkIn.createdAt)}</span
				>
			</span>
		{:else}
			{#if checkIn.product}
				<ProductChip
					product={checkIn.product}
					showImage={false}
					size="sm"
					variant="tile"
				/>
			{:else}
				<span></span>
			{/if}
			<span class="font-mono text-xs text-muted-foreground"
				>{formatRelative(checkIn.createdAt)}</span
			>
		{/if}
	</div>
	<div class="flex flex-col gap-2 text-sm leading-normal">
		<div>
			<span class="text-xs font-medium text-status-launched">avançou</span>
			<div>{checkIn.progress}</div>
		</div>
		<div>
			<span class="text-xs font-medium text-status-validating">travou</span>
			<div>{checkIn.blocked}</div>
		</div>
		{#if checkIn.help}
			<div>
				<span class="text-xs font-medium text-status-building"
					>precisa de ajuda</span
				>
				<div>{checkIn.help}</div>
			</div>
		{/if}
	</div>
</motion.div>
