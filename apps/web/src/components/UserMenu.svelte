<script lang="ts">
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { Button } from "$lib/components/ui/button/index.js";

	const sessionQuery = authClient.useSession();

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
			<a
				class="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground"
				href={`/profile/${currentUser.id}`}
				title={currentUser.name}
			>
				{(currentUser.name || currentUser.email || "?").charAt(0).toUpperCase()}
			</a>
			<Button onclick={handleSignOut} size="sm" variant="ghost">Sair</Button>
		</div>
	{:else}
		<Button href="/login" size="sm">Entrar</Button>
	{/if}
</div>
