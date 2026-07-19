<script lang="ts">
	import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Loader } from "$lib/components/ui/loader/index.js";
	import { orpc } from "$lib/orpc";

	const interestLabels: Record<string, string> = {
		building: "Construindo/idealizando",
		observing: "Só observando",
		running: "Já tenho produto rodando",
	};

	const sessionQuery = authClient.useSession();
	const isSuperAdmin = $derived(
		$sessionQuery.data?.user.role === "super_admin"
	);

	$effect(() => {
		if (!$sessionQuery.isPending && !isSuperAdmin) {
			goto("/board");
		}
	});

	const queryClient = useQueryClient();
	const pendingQuery = createQuery(() => ({
		...orpc.admin.listPendingUsers.queryOptions(),
		enabled: isSuperAdmin,
	}));

	function invalidate() {
		queryClient.invalidateQueries({
			queryKey: orpc.admin.listPendingUsers.queryOptions().queryKey,
		});
	}

	const approveUser = createMutation(() => ({
		...orpc.admin.approveUser.mutationOptions(),
		onSuccess: invalidate,
	}));

	const rejectUser = createMutation(() => ({
		...orpc.admin.rejectUser.mutationOptions(),
		onSuccess: invalidate,
	}));
</script>

<div class="mx-auto max-w-4xl px-4 py-8 md:px-6">
	<div class="mb-6 border-border border-b pb-5">
		<h1 class="text-2xl font-bold tracking-tight">Solicitações</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Contas aguardando aprovação para entrar na matilha
		</p>
	</div>
	{#if pendingQuery.isLoading}
		<Loader
			size="sm"
			subtitle="Buscando solicitações"
			title="Carregando..."
		/>
	{:else if !pendingQuery.data?.length}
		<p class="text-sm text-muted-foreground">
			Nenhuma solicitação pendente no momento.
		</p>
	{:else}
		<div class="flex flex-col gap-3">
			{#each pendingQuery.data as request (request.userId)}
				<div
					class="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
				>
					<div class="flex flex-col gap-0.5">
						<span class="text-sm font-semibold">{request.name}</span>
						<span class="text-xs text-muted-foreground">{request.email}</span>
						{#if request.phone}
							<span class="text-xs text-muted-foreground"
								>{request.phone}</span
							>
						{/if}
						{#if request.interest}
							<span class="mt-1 text-xs text-streak"
								>{interestLabels[request.interest]}</span
							>
						{/if}
					</div>
					<div class="flex gap-2">
						<Button
							disabled={rejectUser.isPending}
							onclick={() => rejectUser.mutate({ userId: request.userId })}
							size="sm"
							variant="outline"
						>
							Recusar
						</Button>
						<Button
							disabled={approveUser.isPending}
							onclick={() => approveUser.mutate({ userId: request.userId })}
							size="sm"
						>
							Aprovar
						</Button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
