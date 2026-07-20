<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import FlagIcon from "@lucide/svelte/icons/flag";
	import { formatRelative } from "$lib/format";
	import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import Avatar from "./avatar.svelte";
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
		founderId?: string;
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

	const isDismissed = $derived(!!checkIn.dismissedAt);
	let confirmOpen = $state(false);
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
			<span class="flex items-center gap-2 text-sm font-semibold">
				<Avatar name={checkIn.name} size="sm" src={checkIn.avatarUrl} />
				{checkIn.name}
			</span>
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
	{#if showAuthor && onDismissVote && !isDismissed}
		<div class="mt-3 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
			{#if checkIn.founderId === currentUserId}
				<span class="text-xs text-muted-foreground">Seu check-in</span>
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
							<AlertDialog.Title>Desconsiderar esse check-in?</AlertDialog.Title>
							<AlertDialog.Description>
								Seu voto conta pra decisão da comunidade. Com 5 votos, o
								check-in de {checkIn.name} é marcado como desconsiderado e ela perde
								o streak que ganhou com ele. Essa ação não pode ser desfeita depois
								de confirmada.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancelar</AlertDialog.Cancel>
							<AlertDialog.Action
								variant="destructive"
								onclick={() => onDismissVote?.(checkIn.id)}
							>
								Confirmar voto
							</AlertDialog.Action>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			{/if}
		</div>
	{/if}
</motion.div>
