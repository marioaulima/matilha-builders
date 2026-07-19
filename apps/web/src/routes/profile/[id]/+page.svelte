<script lang="ts">
	import PencilIcon from "@lucide/svelte/icons/pencil";
	import StarIcon from "@lucide/svelte/icons/star";
	import Trash2Icon from "@lucide/svelte/icons/trash-2";
	import { MAX_PRODUCTS_PER_FOUNDER } from "@matilha-builders/api/lib/constants";
	import { createForm } from "@tanstack/svelte-form";
	import {
		createMutation,
		createQuery,
		useQueryClient,
	} from "@tanstack/svelte-query";
	import { z } from "zod";
	import { page } from "$app/state";
	import { authClient } from "$lib/auth-client";
	import Avatar from "$lib/components/matilha/Avatar.svelte";
	import CheckInItem from "$lib/components/matilha/CheckInItem.svelte";
	import Field from "$lib/components/matilha/Field.svelte";
	import ImageUploadButton from "$lib/components/matilha/ImageUploadButton.svelte";
	import ProductChip from "$lib/components/matilha/ProductChip.svelte";
	import StreakBadge from "$lib/components/matilha/StreakBadge.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card } from "$lib/components/ui/card/index.js";
	import * as Drawer from "$lib/components/ui/drawer/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { orpc } from "$lib/orpc";

	const founderId = $derived(page.params.id ?? "");
	const sessionQuery = authClient.useSession();
	const isOwnProfile = $derived($sessionQuery.data?.user.id === founderId);
	const founderQuery = createQuery(() =>
		orpc.founders.get.queryOptions({ input: { founderId } })
	);
	const historyQuery = createQuery(() =>
		orpc.checkIns.listByFounder.queryOptions({ input: { founderId } })
	);

	const queryClient = useQueryClient();
	function refetchFounder() {
		founderQuery.refetch();
	}

	const productSchema = z.object({
		icp: z.string(),
		link: z.union([
			z.literal(""),
			z.url("Link precisa ser uma URL válida (ex: https://seusite.com)"),
		]),
		name: z.string().min(1, "Nome do produto é obrigatório"),
		painPoint: z.string(),
		solution: z.string(),
	});

	let showAddProduct = $state(false);

	const createProduct = createMutation(() => ({
		...orpc.products.create.mutationOptions(),
		onSuccess: () => {
			addProductForm.reset();
			showAddProduct = false;
			refetchFounder();
			queryClient.invalidateQueries({
				queryKey: orpc.products.mine.queryOptions().queryKey,
			});
		},
	}));

	const addProductForm = createForm(() => ({
		defaultValues: { icp: "", link: "", name: "", painPoint: "", solution: "" },
		onSubmit: async ({ value }) => {
			await createProduct.mutateAsync({
				icp: value.icp || undefined,
				link: value.link,
				name: value.name,
				painPoint: value.painPoint || undefined,
				solution: value.solution || undefined,
			});
		},
		validators: { onSubmit: productSchema },
	}));

	type SubmitState = Pick<
		typeof addProductForm.state,
		"canSubmit" | "isSubmitting"
	>;

	const updateProductStatus = createMutation(() => ({
		...orpc.products.update.mutationOptions(),
		onSuccess: refetchFounder,
	}));

	const setFeaturedProduct = createMutation(() => ({
		...orpc.founders.setFeaturedProduct.mutationOptions(),
		onSuccess: refetchFounder,
	}));

	function toggleFeatured(productId: string, currentFeaturedId: string | null) {
		setFeaturedProduct.mutate({
			productId: currentFeaturedId === productId ? null : productId,
		});
	}

	let editingId = $state<string | null>(null);

	function startEdit(p: {
		id: string;
		name: string;
		link: string | null;
		icp?: string | null;
		painPoint?: string | null;
		solution?: string | null;
	}) {
		editingId = p.id;
		editProductForm.reset({
			icp: p.icp ?? "",
			link: p.link ?? "",
			name: p.name,
			painPoint: p.painPoint ?? "",
			solution: p.solution ?? "",
		});
	}

	function cancelEdit() {
		editingId = null;
	}

	const updateProduct = createMutation(() => ({
		...orpc.products.update.mutationOptions(),
		onSuccess: () => {
			editingId = null;
			refetchFounder();
			queryClient.invalidateQueries({
				queryKey: orpc.products.mine.queryOptions().queryKey,
			});
		},
	}));

	const editProductForm = createForm(() => ({
		defaultValues: { icp: "", link: "", name: "", painPoint: "", solution: "" },
		onSubmit: async ({ value }) => {
			if (!editingId) {
				return;
			}
			await updateProduct.mutateAsync({
				icp: value.icp || undefined,
				id: editingId,
				link: value.link,
				name: value.name,
				painPoint: value.painPoint || undefined,
				solution: value.solution || undefined,
			});
		},
		validators: { onSubmit: productSchema },
	}));

	const profileSchema = z.object({
		bio: z.string(),
		name: z.string().min(1, "Nome é obrigatório"),
	});

	let showEditProfile = $state(false);

	const updateBio = createMutation(() => ({
		...orpc.founders.updateBio.mutationOptions(),
	}));

	const profileForm = createForm(() => ({
		defaultValues: { bio: "", name: "" },
		onSubmit: async ({ value }) => {
			await authClient.updateUser({ name: value.name });
			await updateBio.mutateAsync({ bio: value.bio });
			showEditProfile = false;
			refetchFounder();
		},
		validators: { onSubmit: profileSchema },
	}));

	function openEditProfile(name: string, bio: string | null) {
		profileForm.reset({ bio: bio ?? "", name });
		showEditProfile = true;
	}

	let confirmDeleteId = $state<string | null>(null);

	const deleteProduct = createMutation(() => ({
		...orpc.products.delete.mutationOptions(),
		onSuccess: () => {
			confirmDeleteId = null;
			refetchFounder();
			queryClient.invalidateQueries({
				queryKey: orpc.products.mine.queryOptions().queryKey,
			});
		},
	}));
</script>

{#if founderQuery.data}
	{@const founder = founderQuery.data}
	<div class="mx-auto max-w-4xl px-4 py-6 md:px-6">
		<div class="mb-6 flex items-start justify-between">
			<div class="flex items-start gap-3">
				{#if isOwnProfile}
					<ImageUploadButton
						endpoint="avatarUploader"
						label="Trocar foto de perfil"
						onUploaded={refetchFounder}
						overlay
					>
						{#snippet children()}
							<Avatar name={founder.name} size="lg" src={founder.avatarUrl} />
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
						<p class="mt-1.5 max-w-md text-sm leading-relaxed">
							{founder.bio}
						</p>
					{/if}
					{#if isOwnProfile}
						<div class="mt-3">
							<Button
								onclick={() => openEditProfile(founder.name, founder.bio)}
								size="sm"
								variant="outline"
							>
								Editar perfil
							</Button>
						</div>
					{/if}
				</div>
			</div>
			<StreakBadge weeks={founder.streak} />
		</div>

		{#if isOwnProfile}
			<Drawer.Root bind:open={showEditProfile}>
				<Drawer.Content>
					<div class="mx-auto w-full max-w-md">
						<Drawer.Header>
							<Drawer.Title>Editar perfil</Drawer.Title>
						</Drawer.Header>
						<form
							class="flex flex-col gap-4 px-4 pb-2"
							onsubmit={(e) => {
								e.preventDefault();
								e.stopPropagation();
								profileForm.handleSubmit();
							}}
						>
							<profileForm.Field name="name">
								{#snippet children(field)}
									<Field
										error={field.state.meta.isTouched
											? field.state.meta.errors[0]?.message
											: undefined}
										htmlFor={field.name}
										label="Nome"
									>
										<Input
											id={field.name}
											name={field.name}
											onblur={field.handleBlur}
											oninput={(e: Event) =>
												field.handleChange((e.target as HTMLInputElement).value)}
											value={field.state.value}
										/>
									</Field>
								{/snippet}
							</profileForm.Field>
							<profileForm.Field name="bio">
								{#snippet children(field)}
									<Field hint="opcional" htmlFor={field.name} label="Bio">
										<Textarea
											id={field.name}
											name={field.name}
											onblur={field.handleBlur}
											oninput={(e: Event) =>
												field.handleChange(
													(e.target as HTMLTextAreaElement).value
												)}
											placeholder="Conta rapidinho quem você é"
											rows={3}
											value={field.state.value}
										/>
									</Field>
								{/snippet}
							</profileForm.Field>
							<profileForm.Subscribe
								selector={(state: typeof profileForm.state): SubmitState => ({
									canSubmit: state.canSubmit,
									isSubmitting: state.isSubmitting,
								})}
							>
								{#snippet children(state: SubmitState)}
									<Button
										disabled={!state.canSubmit || state.isSubmitting}
										type="submit"
									>
										{state.isSubmitting ? "Salvando..." : "Salvar"}
									</Button>
								{/snippet}
							</profileForm.Subscribe>
						</form>
						<Drawer.Footer>
							<Drawer.Close
								class="h-9 w-full rounded-md border border-border text-sm transition-colors hover:bg-accent"
							>
								Cancelar
							</Drawer.Close>
						</Drawer.Footer>
					</div>
				</Drawer.Content>
			</Drawer.Root>
		{/if}

		<section class="mb-6">
			<div class="mb-2.5 flex items-center justify-between">
				<h2 class="text-sm font-semibold text-muted-foreground">
					Produtos
					<span class="font-normal text-muted-foreground/70">
						({founder.products.length}/{MAX_PRODUCTS_PER_FOUNDER})
					</span>
				</h2>
				{#if isOwnProfile}
					{#if founder.products.length < MAX_PRODUCTS_PER_FOUNDER}
						<button
							class="text-xs font-medium text-foreground underline underline-offset-2 hover:text-neutral-400"
							onclick={() => (showAddProduct = !showAddProduct)}
							type="button"
						>
							{showAddProduct ? "cancelar" : "+ novo produto"}
						</button>
					{:else}
						<span class="text-xs text-muted-foreground">
							Limite de {MAX_PRODUCTS_PER_FOUNDER} produtos atingido
						</span>
					{/if}
				{/if}
			</div>

			{#if isOwnProfile && showAddProduct && founder.products.length < MAX_PRODUCTS_PER_FOUNDER}
				<Card class="mb-3 border border-border p-4">
					<form
						class="flex flex-col gap-3"
						onsubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							addProductForm.handleSubmit();
						}}
					>
						<addProductForm.Field name="name">
							{#snippet children(field)}
								<Field
									error={field.state.meta.isTouched
										? field.state.meta.errors[0]?.message
										: undefined}
									htmlFor={field.name}
									label="Nome do produto"
								>
									<Input
										id={field.name}
										name={field.name}
										onblur={field.handleBlur}
										oninput={(e: Event) =>
											field.handleChange((e.target as HTMLInputElement).value)}
										placeholder="ex: Matilha Builders"
										value={field.state.value}
									/>
								</Field>
							{/snippet}
						</addProductForm.Field>
						<addProductForm.Field name="link">
							{#snippet children(field)}
								<Field
									error={field.state.meta.isTouched
										? field.state.meta.errors[0]?.message
										: undefined}
									hint="opcional"
									htmlFor={field.name}
									label="Link"
								>
									<Input
										id={field.name}
										name={field.name}
										onblur={field.handleBlur}
										oninput={(e: Event) =>
											field.handleChange((e.target as HTMLInputElement).value)}
										placeholder="https://..."
										value={field.state.value}
									/>
								</Field>
							{/snippet}
						</addProductForm.Field>
						<addProductForm.Field name="icp">
							{#snippet children(field)}
								<Field hint="opcional" htmlFor={field.name} label="ICP">
									<Textarea
										id={field.name}
										name={field.name}
										onblur={field.handleBlur}
										oninput={(e: Event) =>
											field.handleChange((e.target as HTMLTextAreaElement).value)}
										placeholder="Quem é o cliente ideal desse produto"
										rows={2}
										value={field.state.value}
									/>
								</Field>
							{/snippet}
						</addProductForm.Field>
						<addProductForm.Field name="painPoint">
							{#snippet children(field)}
								<Field
									hint="opcional"
									htmlFor={field.name}
									label="Dor a ser resolvida"
								>
									<Textarea
										id={field.name}
										name={field.name}
										onblur={field.handleBlur}
										oninput={(e: Event) =>
											field.handleChange((e.target as HTMLTextAreaElement).value)}
										placeholder="Qual problema esse produto resolve"
										rows={2}
										value={field.state.value}
									/>
								</Field>
							{/snippet}
						</addProductForm.Field>
						<addProductForm.Field name="solution">
							{#snippet children(field)}
								<Field hint="opcional" htmlFor={field.name} label="Solução">
									<Textarea
										id={field.name}
										name={field.name}
										onblur={field.handleBlur}
										oninput={(e: Event) =>
											field.handleChange((e.target as HTMLTextAreaElement).value)}
										placeholder="Como o produto resolve essa dor"
										rows={2}
										value={field.state.value}
									/>
								</Field>
							{/snippet}
						</addProductForm.Field>
						<addProductForm.Subscribe
							selector={(state: typeof addProductForm.state): SubmitState => ({
								canSubmit: state.canSubmit,
								isSubmitting: state.isSubmitting,
							})}
						>
							{#snippet children(state: SubmitState)}
								<Button
									disabled={!state.canSubmit || state.isSubmitting}
									size="sm"
									type="submit"
								>
									{state.isSubmitting ? "Salvando..." : "Adicionar produto"}
								</Button>
							{/snippet}
						</addProductForm.Subscribe>
						{#if createProduct.isError}
							<p class="text-destructive text-xs">
								{createProduct.error.message}
							</p>
						{/if}
					</form>
				</Card>
			{/if}

			{#if founder.products.length}
				<div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
					{#each founder.products as p (p.id)}
						<div
							class="flex flex-col gap-4 rounded-xl border border-border p-4"
						>
							{#if editingId === p.id}
								<form
									class="flex flex-col gap-3"
									onsubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();
										editProductForm.handleSubmit();
									}}
								>
									<editProductForm.Field name="name">
										{#snippet children(field)}
											<Field
												error={field.state.meta.isTouched
													? field.state.meta.errors[0]?.message
													: undefined}
												htmlFor={field.name}
												label="Nome do produto"
											>
												<Input
													id={field.name}
													name={field.name}
													onblur={field.handleBlur}
													oninput={(e: Event) =>
														field.handleChange(
															(e.target as HTMLInputElement).value
														)}
													value={field.state.value}
												/>
											</Field>
										{/snippet}
									</editProductForm.Field>
									<editProductForm.Field name="link">
										{#snippet children(field)}
											<Field
												error={field.state.meta.isTouched
													? field.state.meta.errors[0]?.message
													: undefined}
												hint="opcional"
												htmlFor={field.name}
												label="Link"
											>
												<Input
													id={field.name}
													name={field.name}
													onblur={field.handleBlur}
													oninput={(e: Event) =>
														field.handleChange(
															(e.target as HTMLInputElement).value
														)}
													placeholder="https://..."
													value={field.state.value}
												/>
											</Field>
										{/snippet}
									</editProductForm.Field>
									<editProductForm.Field name="icp">
										{#snippet children(field)}
											<Field hint="opcional" htmlFor={field.name} label="ICP">
												<Textarea
													id={field.name}
													name={field.name}
													onblur={field.handleBlur}
													oninput={(e: Event) =>
														field.handleChange(
															(e.target as HTMLTextAreaElement).value
														)}
													placeholder="Quem é o cliente ideal desse produto"
													rows={2}
													value={field.state.value}
												/>
											</Field>
										{/snippet}
									</editProductForm.Field>
									<editProductForm.Field name="painPoint">
										{#snippet children(field)}
											<Field
												hint="opcional"
												htmlFor={field.name}
												label="Dor a ser resolvida"
											>
												<Textarea
													id={field.name}
													name={field.name}
													onblur={field.handleBlur}
													oninput={(e: Event) =>
														field.handleChange(
															(e.target as HTMLTextAreaElement).value
														)}
													placeholder="Qual problema esse produto resolve"
													rows={2}
													value={field.state.value}
												/>
											</Field>
										{/snippet}
									</editProductForm.Field>
									<editProductForm.Field name="solution">
										{#snippet children(field)}
											<Field hint="opcional" htmlFor={field.name} label="Solução">
												<Textarea
													id={field.name}
													name={field.name}
													onblur={field.handleBlur}
													oninput={(e: Event) =>
														field.handleChange(
															(e.target as HTMLTextAreaElement).value
														)}
													placeholder="Como o produto resolve essa dor"
													rows={2}
													value={field.state.value}
												/>
											</Field>
										{/snippet}
									</editProductForm.Field>
									<div class="flex gap-2">
										<editProductForm.Subscribe
											selector={(state: typeof editProductForm.state): SubmitState => ({
												canSubmit: state.canSubmit,
												isSubmitting: state.isSubmitting,
											})}
										>
											{#snippet children(state: SubmitState)}
												<Button
													disabled={!state.canSubmit || state.isSubmitting}
													size="sm"
													type="submit"
												>
													{state.isSubmitting ? "Salvando..." : "Salvar"}
												</Button>
											{/snippet}
										</editProductForm.Subscribe>
										<Button
											onclick={cancelEdit}
											size="sm"
											type="button"
											variant="outline"
										>
											Cancelar
										</Button>
									</div>
								</form>
							{:else}
								<ProductChip
									product={p}
									showStatus={!isOwnProfile}
									size="md"
									variant="cover"
								/>
								{#if isOwnProfile}
									<Field label="Status">
										<Select.Root
											onValueChange={(v) =>
												updateProductStatus.mutate({
													id: p.id,
													status: v as "validating" | "building" | "launched",
												})}
											type="single"
											value={p.status}
										>
											<Select.Trigger class="w-full text-xs" size="sm">
												{p.status === "validating"
													? "Validando"
													: p.status === "building"
														? "Construindo"
														: "Lançado"}
											</Select.Trigger>
											<Select.Content>
												<Select.Item label="Validando" value="validating"
													>Validando</Select.Item
												>
												<Select.Item label="Construindo" value="building"
													>Construindo</Select.Item
												>
												<Select.Item label="Lançado" value="launched"
													>Lançado</Select.Item
												>
											</Select.Content>
										</Select.Root>
									</Field>

									{#if confirmDeleteId === p.id}
										<div class="flex items-center gap-2">
											<Button
												class="h-8"
												disabled={deleteProduct.isPending}
												onclick={() => deleteProduct.mutate({ id: p.id })}
												size="sm"
												variant="destructive"
											>
												{deleteProduct.isPending
													? "Excluindo..."
													: "Confirmar exclusão"}
											</Button>
											<button
												class="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
												onclick={() => (confirmDeleteId = null)}
												type="button"
											>
												cancelar
											</button>
										</div>
									{:else}
										<div class="flex items-center gap-2">
											<button
												class="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs transition-colors hover:bg-accent"
												onclick={() =>
													toggleFeatured(p.id, founder.featuredProductId)}
												title={founder.featuredProductId === p.id
													? "Remover destaque"
													: "Destacar no board"}
												type="button"
												class:border-streak={founder.featuredProductId === p.id}
												class:text-streak={founder.featuredProductId === p.id}
											>
												<StarIcon
													class="size-3.5"
													fill={founder.featuredProductId === p.id
														? "currentColor"
														: "none"}
												/>
												{founder.featuredProductId === p.id
													? "Produto destacado"
													: "Destacar produto"}
											</button>
											<div class="ml-auto flex items-center gap-2">
												<ImageUploadButton
													endpoint="productImageUploader"
													iconOnly
													input={{ productId: p.id }}
													label="Trocar foto do produto"
													onUploaded={refetchFounder}
												/>
												<button
													class="flex size-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
													onclick={() => startEdit(p)}
													title="Editar produto"
													type="button"
												>
													<PencilIcon class="size-3.5" />
												</button>
												<button
													class="flex size-8 items-center justify-center rounded-md border border-border text-destructive transition-colors hover:bg-destructive/10"
													onclick={() => (confirmDeleteId = p.id)}
													title="Excluir produto"
													type="button"
												>
													<Trash2Icon class="size-3.5" />
												</button>
											</div>
										</div>
									{/if}
								{/if}
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">
					{isOwnProfile ? "Cadastra teu primeiro produto." : "Sem produtos ainda."}
				</p>
			{/if}
		</section>

		<p class="mb-3 font-mono text-[13px] text-muted-foreground">
			{historyQuery.data?.length ?? 0}
			{historyQuery.data?.length === 1 ? "check-in" : "check-ins"}
			· olha quanto já andou
		</p>
		<div class="flex flex-col gap-3">
			{#if historyQuery.data?.length}
				{#each historyQuery.data as ci, index (ci.id)}
					<CheckInItem
						checkIn={{ ...ci, name: founder.name }}
						{index}
						showAuthor={false}
					/>
				{/each}
			{:else}
				<p class="text-sm text-muted-foreground">
					Nenhum check-in ainda. Começa essa semana.
				</p>
			{/if}
		</div>
	</div>
{/if}
