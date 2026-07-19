<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { goto } from "$app/navigation";
	import { formatRelative } from "$lib/format";
	import Avatar from "./Avatar.svelte";
	import StatusBadge from "./StatusBadge.svelte";
	import StreakBadge from "./StreakBadge.svelte";

	type Founder = {
		userId: string;
		name: string;
		product: string;
		link: string | null;
		status: "validating" | "building" | "launched";
		streak: number;
		lastCheckInAt: string | Date | null;
		avatarUrl?: string | null;
		productImageUrl?: string | null;
	};

	let { founder, index = 0 }: { founder: Founder; index?: number } = $props();

	function openProfile() {
		goto(`/profile/${founder.userId}`);
	}

	function onProfileKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			openProfile();
		}
	}
</script>

<motion.div
	animate={{ opacity: 1, y: 0 }}
	class="block cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40 hover:[@media(hover:hover)and(pointer:fine)]:border-foreground/20"
	initial={{ opacity: 0, y: 6 }}
	onclick={openProfile}
	onkeydown={onProfileKeydown}
	role="link"
	tabindex="0"
	transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
	whileTap={{ scale: 0.99 }}
>
	<div class="flex items-start justify-between gap-2">
		<div class="flex items-start gap-2.5">
			<Avatar name={founder.name} src={founder.avatarUrl} />
			<div>
				<div class="text-[15px] font-semibold">{founder.name}</div>
				<div class="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
					{#if founder.productImageUrl}
						<img
							alt=""
							class="size-4 rounded object-cover"
							src={founder.productImageUrl}
						/>
					{/if}
					{founder.product}
					{#if founder.link}
						<span>
							·
							<a
								class="text-muted-foreground transition-colors hover:text-neutral-400"
								href={founder.link}
								onclick={(e) => e.stopPropagation()}
								rel="noreferrer"
								target="_blank"
							>
								{founder.link.replace("https://", "")}
							</a>
						</span>
					{/if}
				</div>
			</div>
		</div>
		<StreakBadge weeks={founder.streak} />
	</div>
	<div class="mt-3.5 flex items-center justify-between">
		<StatusBadge status={founder.status} />
		<span class="text-xs text-muted-foreground">
			{founder.lastCheckInAt ? `atualizado ${formatRelative(founder.lastCheckInAt)}` : "ainda sem check-in"}
		</span>
	</div>
</motion.div>
