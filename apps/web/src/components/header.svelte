<script lang="ts">
	import MenuIcon from "@lucide/svelte/icons/menu";
	import PawPrintIcon from "@lucide/svelte/icons/paw-print";
	import { page } from "$app/state";
	import { authClient } from "$lib/auth-client";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { cn } from "$lib/utils.js";
	import UserMenu from "./user-menu.svelte";

	const sessionQuery = authClient.useSession();
	const isSuperAdmin = $derived(
		$sessionQuery.data?.user.role === "super_admin"
	);

	const baseLinks = [
		{ href: "/board", label: "Board" },
		{ href: "/feed", label: "Feed" },
		{ href: "/checkin", label: "Check-in" },
	];
	const links = $derived(
		isSuperAdmin
			? [...baseLinks, { href: "/requests", label: "Solicitações" }]
			: baseLinks
	);

	let mobileNavOpen = $state(false);
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
				<PawPrintIcon class="size-4 text-streak" fill="currentColor" />
				<span class="hidden sm:inline">matilha_builders</span>
			</a>
			<nav aria-label="Principal" class="hidden gap-1 md:flex">
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
		<div class="flex items-center gap-1">
			<button
				aria-label="Abrir menu"
				class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
				onclick={() => (mobileNavOpen = true)}
				type="button"
			>
				<MenuIcon class="size-5" />
			</button>
			<UserMenu />
		</div>
	</div>
</div>

<Drawer.Root bind:open={mobileNavOpen}>
	<Drawer.Content>
		<div class="mx-auto w-full max-w-md">
			<Drawer.Header>
				<Drawer.Title>Menu</Drawer.Title>
			</Drawer.Header>
			<nav aria-label="Menu mobile" class="flex flex-col gap-1 px-4 pb-6">
				{#each links as link (link.href)}
					<a
						class={cn(
							"rounded-md px-3 py-2.5 text-sm transition-colors",
							page.url.pathname === link.href
								? "bg-accent font-semibold text-foreground"
								: "text-muted-foreground hover:text-foreground"
						)}
						href={link.href}
						onclick={() => (mobileNavOpen = false)}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	</Drawer.Content>
</Drawer.Root>
