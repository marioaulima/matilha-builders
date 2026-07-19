<script lang="ts">
	import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
	import { cn } from "$lib/utils.js";

	type Status = "validating" | "building" | "launched";

	type Product = {
		id: string;
		name: string;
		link?: string | null;
		imageUrl?: string | null;
		status?: Status;
	};

	let {
		product,
		variant = "cover",
		size = "md",
		showStatus = true,
		class: className,
	}: {
		product: Product;
		variant?: "cover" | "tile" | "tag";
		size?: "md" | "lg";
		showStatus?: boolean;
		class?: string;
	} = $props();

	const dims = $derived(
		variant === "tag" ? "size-6" : size === "lg" ? "size-16" : "size-12"
	);
	const radius = $derived(variant === "tag" ? "rounded-md" : "rounded-xl");
	const initialSize = $derived(
		variant === "tag" ? "text-xs" : size === "lg" ? "text-xl" : "text-base"
	);
	const coverHeight = $derived(size === "lg" ? "h-56" : "h-50");

	const statusLabels: Record<Status, string> = {
		building: "construindo",
		launched: "lançado",
		validating: "validando",
	};

	const dotStyles: Record<Status, string> = {
		building: "bg-status-building",
		launched: "bg-status-launched",
		validating: "bg-status-validating",
	};

	const initial = $derived((product.name || "?").charAt(0).toUpperCase());
</script>

{#snippet thumb()}
	{#if product.imageUrl}
		<img
			alt=""
			class={cn("shrink-0 object-cover ring-1 ring-border", dims, radius)}
			src={product.imageUrl}
		>
	{:else}
		<span
			class={cn(
				"flex shrink-0 items-center justify-center bg-muted font-semibold text-muted-foreground ring-1 ring-border",
				dims,
				radius,
				initialSize
			)}
		>
			{initial}
		</span>
	{/if}
{/snippet}

{#snippet caption()}
	<div class="flex items-center justify-between gap-2">
		{#if product.link}
			<a
				class="flex min-w-0 items-center gap-1 truncate font-semibold text-[15px] text-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-streak hover:decoration-streak"
				href={product.link}
				onclick={(e) => e.stopPropagation()}
				rel="noreferrer"
				target="_blank"
			>
				<span class="truncate">{product.name}</span>
				<ExternalLinkIcon class="size-3.5 shrink-0" />
			</a>
		{:else}
			<span class="truncate font-semibold text-[15px]">{product.name}</span>
		{/if}
		{#if product.status && showStatus}
			<span
				class="flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs"
			>
				<span
					class={cn("size-1.5 rounded-full", dotStyles[product.status])}
				></span>
				{statusLabels[product.status]}
			</span>
		{/if}
	</div>
{/snippet}

{#if variant === "tag"}
	<span
		class={cn(
			"inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 py-0.5 pr-2.5 pl-0.5 text-xs font-medium",
			className
		)}
	>
		{@render thumb()}
		{#if product.link}
			<a
				class="flex items-center gap-0.5 underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:text-streak hover:decoration-streak"
				href={product.link}
				onclick={(e) => e.stopPropagation()}
				rel="noreferrer"
				target="_blank"
			>
				{product.name}
				<ExternalLinkIcon class="size-3 shrink-0" />
			</a>
		{:else}
			{product.name}
		{/if}
		{#if product.status}
			<span class="flex items-center gap-1 text-muted-foreground">
				<span
					class={cn("size-1.5 rounded-full", dotStyles[product.status])}
				></span>
				{statusLabels[product.status]}
			</span>
		{/if}
	</span>
{:else if variant === "tile"}
	<div class={cn("flex items-center gap-3", className)}>
		{@render thumb()}
		<div class="min-w-0 flex-1">
			{@render caption()}
		</div>
	</div>
{:else}
	<div class={cn("flex flex-col gap-2", className)}>
		<div
			class={cn("w-full overflow-hidden rounded-xl bg-muted ring-1 ring-border", coverHeight)}
		>
			{#if product.imageUrl}
				<img alt="" class="h-full w-full object-cover" src={product.imageUrl}>
			{:else}
				<div
					class="flex h-full w-full items-center justify-center font-bold text-3xl text-muted-foreground"
				>
					{initial}
				</div>
			{/if}
		</div>
		{@render caption()}
	</div>
{/if}
