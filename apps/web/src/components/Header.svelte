<script lang="ts">
	import { page } from "$app/state";
	import UserMenu from "./UserMenu.svelte";

	const links = [
		{ href: "/board", label: "Board" },
		{ href: "/feed", label: "Feed" },
		{ href: "/checkin", label: "Check-in" },
	];
</script>

<div>
	<div
		class="mx-auto flex max-w-4xl items-center justify-between px-4 py-2.5 md:px-6"
	>
		<div class="flex items-center gap-5">
			<a class="font-mono text-[15px] font-bold" href="/board"
				>matilha_builders</a
			>
			<nav class="flex gap-4">
				{#each links as link (link.href)}
					<a
						class={page.url.pathname === link.href
							? "text-sm font-semibold text-foreground"
							: "text-sm text-muted-foreground transition-colors hover:text-neutral-400"}
						href={link.href}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
		<UserMenu />
	</div>
	<hr class="border-border">
</div>
