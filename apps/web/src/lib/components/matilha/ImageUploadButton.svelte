<script lang="ts">
	import ImagePlusIcon from "@lucide/svelte/icons/image-plus";
	import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import type { Snippet } from "svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { createUploadThing } from "$lib/uploadthing";

	let {
		endpoint,
		label,
		onUploaded,
		input,
		iconOnly = false,
		overlay = false,
		children,
	}: {
		endpoint: "avatarUploader" | "productImageUploader";
		label: string;
		onUploaded: () => void;
		input?: { productId: string };
		iconOnly?: boolean;
		overlay?: boolean;
		children?: Snippet;
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
{#if overlay}
	<button
		class="group/avatar relative rounded-full disabled:pointer-events-none"
		disabled={$isUploading}
		onclick={() => fileInput?.click()}
		title={label}
		type="button"
	>
		{@render children?.()}
		<span
			class="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 opacity-0 transition-all duration-200 group-hover/avatar:bg-black/50 group-hover/avatar:opacity-100"
		>
			{#if $isUploading}
				<LoaderCircleIcon class="size-4 animate-spin text-white" />
			{:else}
				<PencilIcon class="size-4 text-white" />
			{/if}
		</span>
	</button>
{:else if iconOnly}
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
