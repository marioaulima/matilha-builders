<script lang="ts">
	import { createQuery } from "@tanstack/svelte-query";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import Avatar from "$lib/components/matilha/Avatar.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { orpc } from "$lib/orpc";

	const sessionQuery = authClient.useSession();
	const currentUserId = $derived($sessionQuery.data?.user.id ?? "");
	const founderQuery = createQuery(() => ({
		...orpc.founders.get.queryOptions({ input: { founderId: currentUserId } }),
		enabled: !!currentUserId,
	}));

	async function handleSignOut() {
		await authClient.signOut({
			fetchOptions: {
				onError: (error) => {
					console.error("Sign out failed:", error);
				},
				onSuccess: () => goto("/login"),
			},
		});
	}
</script>

<div class="relative">
	{#if $sessionQuery.isPending}
		<div class="size-7 animate-pulse rounded-full bg-secondary"></div>
	{:else if $sessionQuery.data?.user}
		{@const currentUser = $sessionQuery.data.user}
		<div class="flex items-center gap-3">
			<a href={`/profile/${currentUser.id}`} title={currentUser.name}>
				<Avatar
					name={currentUser.name || currentUser.email || "?"}
					src={founderQuery.data?.avatarUrl}
				/>
			</a>
			<Button onclick={handleSignOut} size="sm" variant="ghost">Sair</Button>
		</div>
	{:else}
		<Button href="/login" size="sm">Entrar</Button>
	{/if}
</div>
