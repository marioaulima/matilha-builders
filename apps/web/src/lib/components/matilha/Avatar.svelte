<script lang="ts">
	import { cn } from "$lib/utils.js";

	let {
		src,
		name,
		size = "md",
		class: className,
	}: {
		src?: string | null;
		name: string;
		size?: "sm" | "md" | "lg";
		class?: string;
	} = $props();

	const sizeClasses = {
		sm: "size-5 text-[10px]",
		md: "size-7 text-xs",
		lg: "size-16 text-xl",
	};

	const initial = $derived((name || "?").charAt(0).toUpperCase());
</script>

{#if src}
	<img
		alt={name}
		class={cn("rounded-full object-cover", sizeClasses[size], className)}
		{src}
	/>
{:else}
	<span
		class={cn(
			"flex items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground",
			sizeClasses[size],
			className
		)}
	>
		{initial}
	</span>
{/if}
