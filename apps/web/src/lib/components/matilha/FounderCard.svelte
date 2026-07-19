<script lang="ts">
	import { goto } from "$app/navigation";
	import { formatRelative } from "$lib/format";
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
	};

	let { founder }: { founder: Founder } = $props();

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

<div
	role="link"
	tabindex="0"
	onclick={openProfile}
	onkeydown={onProfileKeydown}
	class="block cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/40"
>
	<div class="flex items-start justify-between gap-2">
		<div>
			<div class="text-[15px] font-semibold">{founder.name}</div>
			<div class="mt-0.5 text-[13px] text-muted-foreground">
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
		<StreakBadge weeks={founder.streak} />
	</div>
	<div class="mt-3.5 flex items-center justify-between">
		<StatusBadge status={founder.status} />
		<span class="text-xs text-muted-foreground">
			{founder.lastCheckInAt ? `atualizado ${formatRelative(founder.lastCheckInAt)}` : "ainda sem check-in"}
		</span>
	</div>
</div>
