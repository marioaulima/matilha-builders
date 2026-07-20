<script lang="ts">
	import LogOutIcon from "@lucide/svelte/icons/log-out";
	import UserIcon from "@lucide/svelte/icons/user";
	import { createQuery } from "@tanstack/svelte-query";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import Avatar from "$lib/components/matilha/avatar.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { toast } from "$lib/components/ui/sonner/index.js";
	import { orpc } from "$lib/orpc";

	const sessionQuery = authClient.useSession();
	const currentUserId = $derived($sessionQuery.data?.user.id ?? "");
	const founderQuery = createQuery(() => ({
		...orpc.founders.get.queryOptions({ input: { founderId: currentUserId } }),
		enabled: !!currentUserId,
	}));

	let open = $state(false);

	async function handleSignOut() {
		open = false;
		await authClient.signOut({
			fetchOptions: {
				onError: (error) => {
					console.error("Sign out failed:", error);
					toast.error("Não deu pra sair. Tenta de novo.");
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
		<Popover.Root bind:open>
			<Popover.Trigger
				class="flex size-7 items-center justify-center rounded-full p-0"
			>
				<Avatar
					name={currentUser.name || currentUser.email || "?"}
					src={founderQuery.data?.avatarUrl}
				/>
			</Popover.Trigger>
			<Popover.Content align="end" class="w-44 gap-1 p-1">
				<a
					class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
					href={`/profile/${currentUser.id}`}
					onclick={() => (open = false)}
				>
					<UserIcon class="size-4" />
					Perfil
				</a>
				<button
					class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-destructive text-sm transition-colors hover:bg-destructive/10"
					onclick={handleSignOut}
					type="button"
				>
					<LogOutIcon class="size-4" />
					Sair
				</button>
			</Popover.Content>
		</Popover.Root>
	{:else}
		<Button href="/login" size="sm">Entrar</Button>
	{/if}
</div>
