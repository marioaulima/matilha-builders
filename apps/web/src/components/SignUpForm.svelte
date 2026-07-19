<script lang="ts">
	import { createForm } from "@tanstack/svelte-form";
	import { motion } from "@humanspeak/svelte-motion";
	import { z } from "zod";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import Field from "$lib/components/matilha/Field.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card } from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	let { switchToSignIn } = $props<{ switchToSignIn: () => void }>();

	const validationSchema = z.object({
		email: z.email("Email inválido"),
		name: z.string().min(2, "Nome precisa ter pelo menos 2 letras"),
		password: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
	});

	const form = createForm(() => ({
		defaultValues: { email: "", name: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{
					email: value.email,
					name: value.name,
					password: value.password,
				},
				{
					onError: (error) => {
						console.error(
							error.error.message || "Não deu pra criar a conta. Tenta de novo."
						);
					},
					onSuccess: () => goto("/board"),
				}
			);
		},
		validators: {
			onSubmit: validationSchema,
		},
	}));

	type SubmitState = Pick<typeof form.state, "canSubmit" | "isSubmitting">;
</script>

<motion.div
	animate={{ opacity: 1, y: 0 }}
	class="mx-auto w-full max-w-[400px] px-4 py-16"
	initial={{ opacity: 0, y: 10 }}
	transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
>
	<div class="mb-6 text-center">
		<div class="font-mono text-2xl font-bold">matilha_builders</div>
		<p class="mt-1.5 text-sm text-muted-foreground">Criar conta na matilha.</p>
	</div>
	<Card class="border border-border p-4">
		<form
			class="flex flex-col gap-4"
			onsubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.Field name="name">
				{#snippet children(field)}
					<Field
						error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
						htmlFor={field.name}
						label="Nome"
					>
						<Input
							id={field.name}
							name={field.name}
							onblur={field.handleBlur}
							oninput={(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="Como te chamam"
							value={field.state.value}
						/>
					</Field>
				{/snippet}
			</form.Field>

			<form.Field name="email">
				{#snippet children(field)}
					<Field
						error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
						htmlFor={field.name}
						label="Email"
					>
						<Input
							id={field.name}
							name={field.name}
							onblur={field.handleBlur}
							oninput={(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="seu@email.com"
							type="email"
							value={field.state.value}
						/>
					</Field>
				{/snippet}
			</form.Field>

			<form.Field name="password">
				{#snippet children(field)}
					<Field
						error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
						htmlFor={field.name}
						label="Senha"
					>
						<Input
							id={field.name}
							name={field.name}
							onblur={field.handleBlur}
							oninput={(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="••••••••"
							type="password"
							value={field.state.value}
						/>
					</Field>
				{/snippet}
			</form.Field>

			<form.Subscribe
				selector={(state: typeof form.state): SubmitState => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
			>
				{#snippet children(state: SubmitState)}
					<Button
						class="w-full"
						disabled={!state.canSubmit || state.isSubmitting}
						type="submit"
					>
						{state.isSubmitting ? "Criando..." : "Criar conta"}
					</Button>
				{/snippet}
			</form.Subscribe>
		</form>
	</Card>
	<p class="mt-4 text-center text-sm text-muted-foreground">
		Já tem conta?
		<button
			class="text-foreground transition-colors hover:text-neutral-400"
			onclick={switchToSignIn}
			type="button"
		>
			Entrar
		</button>
	</p>
</motion.div>
