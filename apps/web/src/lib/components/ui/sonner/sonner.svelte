<script lang="ts">
	import { Toaster as Sonner, type ToasterProps } from "svelte-sonner";

	let { ...restProps }: ToasterProps = $props();
</script>

<Sonner
	class="toaster group"
	richColors
	style="--normal-bg: var(--popover); --normal-text: var(--popover-foreground); --normal-border: var(--border); --font-mono: var(--font-mono, ui-monospace);"
	theme="dark"
	{...restProps}
/>
