<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import Avatar from "./avatar.svelte";
	import ImageUploadButton from "./image-upload-button.svelte";
	import StreakBadge from "./streak-badge.svelte";

	interface Founder {
		avatarUrl: string | null;
		bio: string | null;
		name: string;
		streak: number;
	}

	let {
		founder,
		isOwnProfile,
		avatarPreview,
		onAvatarPreview,
		onAvatarUploaded,
		onEdit,
	}: {
		founder: Founder;
		isOwnProfile: boolean;
		avatarPreview: string | null;
		onAvatarPreview: (url: string | null) => void;
		onAvatarUploaded: () => Promise<unknown>;
		onEdit: () => void;
	} = $props();
</script>

<div class="mb-6 flex items-start justify-between">
	<div class="flex items-start gap-3">
		{#if isOwnProfile}
			<ImageUploadButton
				endpoint="avatarUploader"
				label="Trocar foto de perfil"
				onPreview={onAvatarPreview}
				onUploaded={onAvatarUploaded}
				overlay
			>
				{#snippet children()}
					<Avatar
						name={founder.name}
						size="lg"
						src={avatarPreview ?? founder.avatarUrl}
					/>
				{/snippet}
			</ImageUploadButton>
		{:else}
			<Avatar name={founder.name} size="lg" src={founder.avatarUrl} />
		{/if}
		<div>
			<h1 class="text-2xl font-bold">{founder.name}</h1>
			<p class="mt-0.5 text-sm text-muted-foreground">
				construindo há {founder.streak}
				{founder.streak === 1 ? "semana seguida" : "semanas seguidas"}
			</p>
			{#if founder.bio}
				<p class="mt-1.5 max-w-md text-sm leading-relaxed">{founder.bio}</p>
			{/if}
			{#if isOwnProfile}
				<div class="mt-3">
					<Button onclick={onEdit} size="sm" variant="outline"
						>Editar perfil</Button
					>
				</div>
			{/if}
		</div>
	</div>
	<StreakBadge weeks={founder.streak} />
</div>
