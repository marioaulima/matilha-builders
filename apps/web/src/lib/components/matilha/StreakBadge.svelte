<script lang="ts">
	let { weeks }: { weeks: number } = $props();
</script>

<span
	class={`inline-flex items-baseline gap-1 font-mono text-sm font-bold ${weeks === 0 ? "text-muted-foreground" : "text-streak"}`}
>
	{weeks}
	<span class="font-sans text-xs font-normal text-muted-foreground"
		>{weeks === 1 ? "semana" : "semanas"}</span
	>
</span>
