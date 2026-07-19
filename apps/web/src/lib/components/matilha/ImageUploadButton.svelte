<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import { createUploadThing } from "$lib/uploadthing";

	let {
		endpoint,
		label,
		onUploaded,
	}: {
		endpoint: "avatarUploader" | "productImageUploader";
		label: string;
		onUploaded: () => void;
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
			startUpload(Array.from(files));
		}
	}
</script>

<input
	accept="image/*"
	bind:this={fileInput}
	class="hidden"
	onchange={handleChange}
	type="file"
/>
<Button
	disabled={$isUploading}
	onclick={() => fileInput?.click()}
	size="sm"
	type="button"
	variant="outline"
>
	{$isUploading ? "Enviando..." : label}
</Button>
