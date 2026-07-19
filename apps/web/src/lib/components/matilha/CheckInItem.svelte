<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { formatRelative } from "$lib/format";
	import { cn } from "$lib/utils.js";

	type CheckIn = {
		id: string;
		name: string;
		product: string;
		progress: string;
		blocked: string;
		help: string | null;
		createdAt: string | Date;
		featured?: boolean;
	};

	let {
		checkIn,
		showAuthor = true,
		index = 0,
	}: { checkIn: CheckIn; showAuthor?: boolean; index?: number } = $props();
</script>

<motion.div
	animate={{ opacity: 1, y: 0 }}
	class={cn("rounded-lg border bg-card p-4", checkIn.featured ? "border-streak" : "border-border")}
	initial={{ opacity: 0, y: 6 }}
	transition={
		checkIn.featured
			? { duration: 0.3, ease: [0.23, 1, 0.32, 1] }
			: { delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }
	}
>
	{#if checkIn.featured}
		<div class="mb-2 font-mono text-[11px] text-streak">
			★ spotlight da semana
		</div>
	{/if}
	<div class="mb-2.5 flex items-baseline justify-between">
		{#if showAuthor}
			<span class="text-sm font-semibold">
				{checkIn.name}
				<span class="font-normal text-muted-foreground">
					· {checkIn.product}</span
				>
			</span>
		{:else}
			<span></span>
		{/if}
		<span class="font-mono text-xs text-muted-foreground"
			>{formatRelative(checkIn.createdAt)}</span
		>
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
