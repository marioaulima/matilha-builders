<script lang="ts">
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import "../app.css";
	import { authClient } from "$lib/auth-client";
	import { queryClient } from "$lib/orpc";
	import Header from "../components/Header.svelte";

	const { children } = $props();
	const isLoginRoute = $derived(page.url.pathname === "/login");
	const sessionQuery = authClient.useSession();

	$effect(() => {
		if (isLoginRoute || $sessionQuery.isPending) {
			return;
		}
		if (!$sessionQuery.data) {
			goto("/login");
		}
	});

	const isAuthorized = $derived(isLoginRoute || !!$sessionQuery.data);
</script>

<QueryClientProvider client={queryClient}>
	{#if isLoginRoute}
		<main class="h-svh overflow-y-auto">
			{@render children()}
		</main>
	{:else if $sessionQuery.isPending}
		<div
			class="flex h-svh items-center justify-center text-sm text-muted-foreground"
		>
			Carregando...
		</div>
	{:else if isAuthorized}
		<div class="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			<main class="overflow-y-auto">
				{@render children()}
			</main>
		</div>
	{:else}
		<div
			class="flex h-svh items-center justify-center text-sm text-muted-foreground"
		>
			Redirecionando...
		</div>
	{/if}
	<SvelteQueryDevtools />
</QueryClientProvider>
