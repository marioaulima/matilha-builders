<script lang="ts">
	import { cn } from "$lib/utils.js";

	let { weeks, class: className }: { weeks: number; class?: string } = $props();
</script>

<span
	class={cn(
		"inline-flex items-baseline gap-1 rounded-full px-2.5 py-1 font-mono text-sm font-bold",
		weeks === 0
			? "bg-muted text-muted-foreground"
			: "bg-streak/12 text-streak",
		className
	)}
>
	{weeks}
	<span class="font-normal font-sans text-[11px] text-muted-foreground">
		{weeks === 1 ? "semana" : "semanas"}
	</span>
</span>
