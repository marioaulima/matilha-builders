<script lang="ts">
	import DotIcon from "@lucide/svelte/icons/dot";
	import { page } from "$app/state";
	import { cn } from "$lib/utils.js";
	import UserMenu from "./UserMenu.svelte";

	const links = [
		{ href: "/board", label: "Board" },
		{ href: "/feed", label: "Feed" },
		{ href: "/checkin", label: "Check-in" },
	];
</script>

<div
	class="sticky top-0 z-10 border-border/60 border-b bg-background/85 backdrop-blur-md"
>
	<div
		class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-6"
	>
		<div class="flex items-center gap-6">
			<a
				class="flex items-center gap-1.5 font-mono text-[15px] font-bold"
				href="/board"
			>
				<DotIcon class="-mx-2 size-6 text-streak" fill="currentColor" />
				matilha_builders
			</a>
			<nav class="flex gap-1">
				{#each links as link (link.href)}
					<a
						class={cn(
							"rounded-md px-2.5 py-1 text-sm transition-colors",
							page.url.pathname === link.href
								? "bg-accent font-semibold text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
						href={link.href}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
		<UserMenu />
	</div>
</div>
