<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { goto } from "$app/navigation";
	import { formatRelative } from "$lib/format";
	import Avatar from "./Avatar.svelte";
	import ProductChip from "./ProductChip.svelte";
	import StreakBadge from "./StreakBadge.svelte";

	type Product = {
		id: string;
		name: string;
		link: string | null;
		imageUrl: string | null;
		status: "validating" | "building" | "launched";
	};

	type Founder = {
		userId: string;
		name: string;
		products: Product[];
		streak: number;
		lastCheckInAt: string | Date | null;
		avatarUrl?: string | null;
	};

	let { founder, index = 0 }: { founder: Founder; index?: number } = $props();

	// Local-only reordering: clicking a secondary product swaps it into the
	// featured slot for this browsing session. Not persisted.
	// svelte-ignore state_referenced_locally
	let localProducts = $state(founder.products);

	function openProfile() {
		goto(`/profile/${founder.userId}`);
	}

	function onProfileKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			openProfile();
		}
	}

	function highlightProduct(e: MouseEvent, clicked: Product) {
		e.stopPropagation();
		localProducts = [
			clicked,
			...localProducts.filter((p) => p.id !== clicked.id),
		];
	}
</script>

<motion.div
	animate={{ opacity: 1, y: 0 }}
	class="flex h-full cursor-pointer flex-col rounded-xl border border-border bg-card p-4 transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-out)] hover:[@media(hover:hover)and(pointer:fine)]:-translate-y-0.5 hover:[@media(hover:hover)and(pointer:fine)]:border-foreground/15 hover:[@media(hover:hover)and(pointer:fine)]:shadow-[0_8px_24px_-8px_rgb(0_0_0_/_0.4)]"
	initial={{ opacity: 0, y: 6 }}
	onclick={openProfile}
	onkeydown={onProfileKeydown}
	role="link"
	tabindex="0"
	transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
	whileTap={{ scale: 0.99 }}
>
	<div class="flex items-start justify-between gap-2">
		<div class="flex items-center gap-2.5">
			<Avatar name={founder.name} src={founder.avatarUrl} />
			<div class="text-[15px] font-semibold">{founder.name}</div>
		</div>
		<StreakBadge weeks={founder.streak} />
	</div>
	<div class="mt-4 flex-1 border-border/60 border-t pt-3.5">
		{#if localProducts.length}
			{@const [primary, ...rest] = localProducts}
			<ProductChip product={primary} variant="cover" />
			{#if rest.length}
				<div class="mt-4 text-muted-foreground text-xs">Outros produtos</div>
				<div class="mt-1.5 flex flex-wrap gap-1.5">
					{#each rest as p (p.id)}
						<button
							class="cursor-pointer rounded-full transition-opacity hover:opacity-80"
							onclick={(e) => highlightProduct(e, p)}
							type="button"
						>
							<ProductChip
								class="pointer-events-none"
								product={p}
								variant="tag"
							/>
						</button>
					{/each}
				</div>
			{/if}
		{:else}
			<span class="text-[13px] text-muted-foreground">sem produtos ainda</span>
		{/if}
	</div>
	<div class="mt-3.5 flex items-center justify-end">
		<span class="text-xs text-muted-foreground">
			{founder.lastCheckInAt
				? `atualizado ${formatRelative(founder.lastCheckInAt)}`
				: "ainda sem check-in"}
		</span>
	</div>
</motion.div>
