<script lang="ts">
	import ImagePlusIcon from "@lucide/svelte/icons/image-plus";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import { Button } from "$lib/components/ui/button/index.js";
	import { createUploadThing } from "$lib/uploadthing";

	let {
		endpoint,
		label,
		onUploaded,
		input,
		iconOnly = false,
	}: {
		endpoint: "avatarUploader" | "productImageUploader";
		label: string;
		onUploaded: () => void;
		input?: { productId: string };
		iconOnly?: boolean;
	} = $props();

	let fileInput: HTMLInputElement | undefined = $state();

	// endpoint is fixed per component instance (used as a hook config, not reactive state).
	// svelte-ignore state_referenced_locally
	const { startUpload, isUploading } = createUploadThing(endpoint, {
		onClientUploadComplete: () => {
			onUploaded();
		},
		onUploadError: (error) => {
			console.error(error.message);
		},
	});

	function handleChange(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (files && files.length > 0) {
			// biome-ignore lint/suspicious/noExplicitAny: startUpload's input type varies per endpoint.
			startUpload(Array.from(files), input as any);
		}
	}
</script>

<input
	accept="image/*"
	class="hidden"
	onchange={handleChange}
	type="file"
	bind:this={fileInput}
>
{#if iconOnly}
	<button
		class="flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
		disabled={$isUploading}
		onclick={() => fileInput?.click()}
		title={label}
		type="button"
	>
		{#if $isUploading}
			<LoaderCircleIcon class="size-3.5 animate-spin" />
		{:else}
			<ImagePlusIcon class="size-3.5" />
		{/if}
	</button>
{:else}
	<Button
		disabled={$isUploading}
		onclick={() => fileInput?.click()}
		size="sm"
		type="button"
		variant="outline"
	>
		{$isUploading ? "Enviando..." : label}
	</Button>
{/if}
