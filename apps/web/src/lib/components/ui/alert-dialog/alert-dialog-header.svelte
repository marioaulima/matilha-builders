<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	class={cn("flex flex-col gap-2 text-center sm:text-left", className)}
	data-slot="alert-dialog-header"
	bind:this={ref}
	{...restProps}
>
	{@render children?.()}
</div>
