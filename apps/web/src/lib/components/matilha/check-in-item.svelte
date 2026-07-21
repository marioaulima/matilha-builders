<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import FlagIcon from "@lucide/svelte/icons/flag";
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import { createMutation, useQueryClient } from "@tanstack/svelte-query";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { toast } from "$lib/components/ui/sonner/index.js";
	import { formatRelative } from "$lib/format";
	import { orpc } from "$lib/orpc";
	import Avatar from "./avatar.svelte";
	import CheckInEditor from "./check-in-editor.svelte";
	import ProductChip from "./product-chip.svelte";

	type Product = {
		id: string;
		name: string;
		link: string | null;
		imageUrl: string | null;
		status: "validating" | "building" | "launched";
	};

	type CheckIn = {
		id: string;
		founderId: string;
		name: string;
		product: Product | null;
		progress: string;
		blocked: string;
		help: string | null;
		createdAt: string | Date;
		avatarUrl?: string | null;
		dismissedAt?: string | Date | null;
		voteCount?: number;
		hasVoted?: boolean;
	};

	let {
		checkIn,
		showAuthor = true,
		index = 0,
		currentUserId = null,
		onDismissVote,
		isVoting = false,
	}: {
		checkIn: CheckIn;
		showAuthor?: boolean;
		index?: number;
		currentUserId?: string | null;
		onDismissVote?: (checkInId: string) => void;
		isVoting?: boolean;
	} = $props();

	// A check-in stays editable through its own week and the next one — mirrors
	// EDIT_WINDOW_MS on the server, which rejects edits past this window.
	const EDIT_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

	const isDismissed = $derived(!!checkIn.dismissedAt);
	const isOwner = $derived(checkIn.founderId === currentUserId);
	const isEditable = $derived(
		isOwner &&
			!isDismissed &&
			Date.now() - new Date(checkIn.createdAt).getTime() < EDIT_WINDOW_MS
	);
	let confirmOpen = $state(false);
	let editOpen = $state(false);

	const queryClient = useQueryClient();

	type CheckInListItem = {
		id: string;
		progress: string;
		blocked: string;
		help: string | null;
	};
	type InfiniteCheckIns = {
		pageParams: unknown[];
		pages: { items: CheckInListItem[]; nextCursor?: number }[];
	};
	type EditorValues = { progress: string; blocked: string; help: string };

	function listKeys() {
		return [orpc.checkIns.listFeed.key(), orpc.checkIns.listByFounder.key()];
	}

	function patchLists(id: string, patch: Partial<CheckInListItem>) {
		for (const queryKey of listKeys()) {
			queryClient.setQueriesData<InfiniteCheckIns>({ queryKey }, (old) =>
				old
					? {
							...old,
							pages: old.pages.map((page) => ({
								...page,
								items: page.items.map((item) =>
									item.id === id ? { ...item, ...patch } : item
								),
							})),
						}
					: old
			);
		}
	}

	function invalidateLists() {
		for (const queryKey of listKeys()) {
			queryClient.invalidateQueries({ queryKey });
		}
	}

	const editMutation = createMutation(() => ({
		...orpc.checkIns.update.mutationOptions(),
		meta: { skipErrorToast: true },
		onError: () => {
			toast.error("Não deu pra salvar o check-in. Tenta de novo.");
			invalidateLists();
		},
		onMutate: (input) => {
			patchLists(input.id, {
				blocked: input.blocked,
				help: input.help ?? null,
				progress: input.progress,
			});
		},
	}));

	function saveEdit(value: EditorValues) {
		editOpen = false;
		editMutation.mutate({
			blocked: value.blocked,
			help: value.help || undefined,
			id: checkIn.id,
			progress: value.progress,
		});
	}

	let editor = $state<{ prime: (v: EditorValues) => void }>();

	function startEditing() {
		editor?.prime({
			blocked: checkIn.blocked,
			help: checkIn.help ?? "",
			progress: checkIn.progress,
		});
		editOpen = true;
	}
</script>

<motion.div
	animate={{ opacity: isDismissed ? 0.55 : 1, y: 0 }}
	class="rounded-xl border border-border bg-card p-4 {isDismissed
		? 'grayscale-[40%]'
		: ''}"
	initial={{ opacity: 0, y: 6 }}
	transition={{ delay: index * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
>
	{#if isDismissed}
		<div
			class="mb-3 flex items-center gap-1.5 text-xs font-medium text-destructive"
		>
			<FlagIcon class="size-3.5" />
			Desconsiderado pela comunidade
		</div>
	{/if}
	<div class="mb-3 flex items-center justify-between gap-3">
		{#if showAuthor}
			<a
				aria-label="Ver perfil de {checkIn.name}"
				class="group flex w-fit items-center gap-2 rounded text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				href="/profile/{checkIn.founderId}"
			>
				<Avatar name={checkIn.name} size="sm" src={checkIn.avatarUrl} />
				<span
					class="underline decoration-muted-foreground/40 underline-offset-2 transition-colors group-hover:decoration-foreground"
					>{checkIn.name}</span
				>
			</a>
			<span class="flex items-center gap-2">
				{#if checkIn.product}
					<ProductChip
						product={checkIn.product}
						showImage={false}
						variant="tag"
					/>
				{/if}
				<span class="font-mono text-xs text-muted-foreground"
					>{formatRelative(checkIn.createdAt)}</span
				>
			</span>
		{:else}
			{#if checkIn.product}
				<ProductChip
					product={checkIn.product}
					showImage={false}
					size="sm"
					variant="tile"
				/>
			{:else}
				<span></span>
			{/if}
			<span class="font-mono text-xs text-muted-foreground"
				>{formatRelative(checkIn.createdAt)}</span
			>
		{/if}
	</div>
	<div class="flex flex-col gap-2 text-sm leading-normal">
		<div>
			<span class="text-xs font-medium text-status-launched">avançou</span>
			<div>{checkIn.progress}</div>
		</div>
		<div>
			<span class="text-xs font-medium text-status-validating">travou</span>
			<div>{checkIn.blocked}</div>
		</div>
		{#if checkIn.help}
			<div>
				<span class="text-xs font-medium text-status-building"
					>precisa de ajuda</span
				>
				<div>{checkIn.help}</div>
			</div>
		{/if}
	</div>
	{#if !isDismissed && ((isOwner && isEditable) || (!isOwner && showAuthor && onDismissVote))}
		<div
			class="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-3"
		>
			{#if isOwner}
				<span class="mr-auto text-xs text-muted-foreground">Seu check-in</span>
				<button
					aria-label="Editar check-in"
					class="flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
					onclick={startEditing}
					title="Editar check-in"
					type="button"
				>
					<PencilIcon class="size-3.5" />
				</button>
			{:else if checkIn.hasVoted}
				<span class="flex items-center gap-1.5 text-xs text-muted-foreground">
					<FlagIcon class="size-3.5" />
					Você votou para desconsiderar · {checkIn.voteCount ?? 0}/5
				</span>
			{:else}
				<AlertDialog.Root bind:open={confirmOpen}>
					<AlertDialog.Trigger>
						{#snippet child({ props })}
							<Button
								{...props}
								class="text-muted-foreground hover:text-destructive"
								disabled={isVoting}
								size="sm"
								variant="ghost"
							>
								<FlagIcon class="size-3.5" />
								Desconsiderar
								{#if checkIn.voteCount}
									<span class="font-mono text-[11px]"
										>({checkIn.voteCount}/5)</span
									>
								{/if}
							</Button>
						{/snippet}
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title
								>Desconsiderar esse check-in?</AlertDialog.Title
							>
							<AlertDialog.Description>
								Seu voto conta pra decisão da comunidade. Com 5 votos, o
								check-in de {checkIn.name} é marcado como desconsiderado e ela
								perde o streak que ganhou com ele. Essa ação não pode ser
								desfeita depois de confirmada.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
							<AlertDialog.Action
								onclick={() => onDismissVote?.(checkIn.id)}
								variant="destructive"
							>
								Confirmar voto
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{/if}
		</div>
	{/if}

	{#if isEditable}
		<CheckInEditor
			isSaving={editMutation.isPending}
			onSave={saveEdit}
			bind:this={editor}
			bind:open={editOpen}
		/>
	{/if}
</motion.div>
