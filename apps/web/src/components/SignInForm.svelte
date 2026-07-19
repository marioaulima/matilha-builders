<script lang="ts">
	import { createForm } from "@tanstack/svelte-form";
	import { z } from "zod";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import Field from "$lib/components/matilha/Field.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card } from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";

	let { switchToSignUp } = $props<{ switchToSignUp: () => void }>();

	const validationSchema = z.object({
		email: z.email("Email inválido"),
		password: z.string().min(1, "Senha é obrigatória"),
	});

	const form = createForm(() => ({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{ email: value.email, password: value.password },
				{
					onError: (error) => {
						console.error(
							error.error.message || "Não deu pra entrar. Tenta de novo."
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

<div class="mx-auto w-full max-w-[400px] px-4 py-16">
	<div class="mb-6 text-center">
		<div class="font-mono text-2xl font-bold">matilha_builders</div>
		<p class="mt-1.5 text-sm text-muted-foreground">
			Só pra quem tá na matilha.
		</p>
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
						{state.isSubmitting ? "Entrando..." : "Entrar"}
					</Button>
				{/snippet}
			</form.Subscribe>
		</form>
	</Card>
	<p class="mt-4 text-center text-sm text-muted-foreground">
		Ainda não tem conta?
		<button
			class="text-foreground transition-colors hover:text-neutral-400"
			onclick={switchToSignUp}
			type="button"
		>
			Criar conta
		</button>
	</p>
</div>
