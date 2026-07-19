<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { createForm } from "@tanstack/svelte-form";
	import { createMutation, createQuery } from "@tanstack/svelte-query";
	import { z } from "zod";
	import { authClient } from "$lib/auth-client";
	import Field from "$lib/components/matilha/Field.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card } from "$lib/components/ui/card/index.js";
	import { Loader } from "$lib/components/ui/loader/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { orpc } from "$lib/orpc";

	const sessionQuery = authClient.useSession();
	const productsQuery = createQuery(() => orpc.products.mine.queryOptions());

	const postCheckIn = createMutation(() =>
		orpc.checkIns.create.mutationOptions()
	);

	const validationSchema = z.object({
		blocked: z.string().min(1, "Conta o que travou"),
		help: z.string(),
		productId: z.string(),
		progress: z.string().min(1, "Conta o que avançou"),
	});

	const form = createForm(() => ({
		defaultValues: { blocked: "", help: "", productId: "", progress: "" },
		onSubmit: async ({ value }) => {
			await postCheckIn.mutateAsync({
				blocked: value.blocked,
				help: value.help || undefined,
				productId: value.productId || undefined,
				progress: value.progress,
			});
		},
		validators: {
			onSubmit: validationSchema,
		},
	}));

	type SubmitState = Pick<typeof form.state, "canSubmit" | "isSubmitting">;
</script>

{#if postCheckIn.isSuccess}
	<div class="mx-auto max-w-4xl px-4 py-12 md:px-6">
		<motion.div
			animate={{ opacity: 1, scale: 1 }}
			class="text-center"
			initial={{ opacity: 0, scale: 0.94 }}
			transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
		>
			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				class="font-mono text-[28px] font-bold text-streak"
				initial={{ opacity: 0, scale: 0.8 }}
				transition={{ delay: 0.1, duration: 0.4, type: "spring", bounce: 0.35 }}
			>
				{postCheckIn.data.streak}
				{postCheckIn.data.streak === 1 ? "semana" : "semanas"}
			</motion.div>
			<p class="mt-1 text-sm text-muted-foreground">
				Check-in postado. Streak mantido.
			</p>
			<Button class="mt-4" href="/feed" variant="outline">Ver o feed</Button>
		</motion.div>
	</div>
{:else}
	<div class="mx-auto max-w-4xl px-4 py-8 md:px-6">
		<div class="mb-6 border-border border-b pb-5">
			<h1 class="text-2xl font-bold tracking-tight">Check-in da semana</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Rápido e direto ao ponto. O que avançou e o que travou são obrigatórios;
				o resto é opcional.
			</p>
		</div>
		{#if productsQuery.isPending}
			<Loader
				size="sm"
				subtitle="Preparando o formulário"
				title="Carregando o check-in..."
			/>
		{:else}
			<Card class="border border-border p-4">
				<form
					class="flex flex-col gap-4"
					onsubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					{#if productsQuery.data && productsQuery.data.length > 0}
						{@const products = productsQuery.data}
						<form.Field name="productId">
							{#snippet children(field)}
								<Field label="Sobre qual produto">
									<Select.Root
										onValueChange={(v) => field.handleChange(v ?? "")}
										type="single"
										value={field.state.value}
									>
										<Select.Trigger class="w-full">
											{products.find((p) => p.id === field.state.value)
												?.name ?? "Escolher produto"}
										</Select.Trigger>
										<Select.Content>
											{#each products as p (p.id)}
												<Select.Item label={p.name} value={p.id}>
													{p.name}
												</Select.Item>
											{/each}
										</Select.Content>
									</Select.Root>
								</Field>
							{/snippet}
						</form.Field>
					{:else if productsQuery.isSuccess}
						<p class="text-xs text-muted-foreground">
							Você ainda não tem produtos cadastrados.
							<a
								class="underline underline-offset-2"
								href="/profile/{$sessionQuery.data?.user.id}"
							>
								Cadastra um no seu perfil</a
							>
							pra linkar o check-in a ele (opcional).
						</p>
					{/if}

					<form.Field name="progress">
						{#snippet children(field)}
							<Field
								error={field.state.meta.isTouched
									? field.state.meta.errors[0]?.message
									: undefined}
								htmlFor={field.name}
								label="O que avançou essa semana"
							>
								<Textarea
									id={field.name}
									name={field.name}
									onblur={field.handleBlur}
									oninput={(e: Event) =>
										field.handleChange((e.target as HTMLTextAreaElement).value)}
									placeholder="Shipei, vendi, aprendi..."
									rows={3}
									value={field.state.value}
								/>
							</Field>
						{/snippet}
					</form.Field>

					<form.Field name="blocked">
						{#snippet children(field)}
							<Field
								error={field.state.meta.isTouched
									? field.state.meta.errors[0]?.message
									: undefined}
								htmlFor={field.name}
								label="O que travou"
							>
								<Textarea
									id={field.name}
									name={field.name}
									onblur={field.handleBlur}
									oninput={(e: Event) =>
										field.handleChange((e.target as HTMLTextAreaElement).value)}
									placeholder="O que te segurou"
									rows={3}
									value={field.state.value}
								/>
							</Field>
						{/snippet}
					</form.Field>

					<form.Field name="help">
						{#snippet children(field)}
							<Field
								hint="opcional"
								htmlFor={field.name}
								label="No que precisa de ajuda"
							>
								<Textarea
									id={field.name}
									name={field.name}
									onblur={field.handleBlur}
									oninput={(e: Event) =>
										field.handleChange((e.target as HTMLTextAreaElement).value)}
									placeholder="A matilha te ajuda"
									rows={2}
									value={field.state.value}
								/>
							</Field>
						{/snippet}
					</form.Field>

					<form.Subscribe
						selector={(state: typeof form.state): SubmitState => ({
							canSubmit: state.canSubmit,
							isSubmitting: state.isSubmitting,
						})}
					>
						{#snippet children(state: SubmitState)}
							<Button
								disabled={!state.canSubmit || state.isSubmitting}
								type="submit"
							>
								{state.isSubmitting ? "Postando..." : "Postar"}
							</Button>
						{/snippet}
					</form.Subscribe>
				</form>
			</Card>
		{/if}
	</div>
{/if}
