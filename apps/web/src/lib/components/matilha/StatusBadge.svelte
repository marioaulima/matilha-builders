<script lang="ts">
	import { cn } from "$lib/utils.js";

	type Status = "validating" | "building" | "launched";

	let { status }: { status: Status } = $props();

	const labels: Record<Status, string> = {
		building: "construindo",
		launched: "lançado",
		validating: "validando",
	};

	const styles: Record<Status, string> = {
		building: "text-status-building bg-status-building-bg",
		launched: "text-status-launched bg-status-launched-bg",
		validating: "text-status-validating bg-status-validating-bg",
	};
</script>

<span
	class={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium", styles[status])}
>
	<span class="size-2 rounded-full bg-current"></span>
	{labels[status]}
</span>
