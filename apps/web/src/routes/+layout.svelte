<script lang="ts">
	import { QueryClientProvider } from "@tanstack/svelte-query";
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
	import { page } from "$app/state";
	import "../app.css";
	import { queryClient } from "$lib/orpc";
	import Header from "../components/Header.svelte";

	const { children } = $props();
	const hideHeader = $derived(page.url.pathname === "/login");
</script>

<QueryClientProvider client={queryClient}>
	{#if hideHeader}
		<main class="h-svh overflow-y-auto">
			{@render children()}
		</main>
	{:else}
		<div class="grid h-svh grid-rows-[auto_1fr]">
			<Header />
			<main class="overflow-y-auto">
				{@render children()}
			</main>
		</div>
	{/if}
	<SvelteQueryDevtools />
</QueryClientProvider>
