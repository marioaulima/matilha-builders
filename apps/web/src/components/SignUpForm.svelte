<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { createForm } from "@tanstack/svelte-form";
	import { createMutation } from "@tanstack/svelte-query";
	import { z } from "zod";
	import { goto } from "$app/navigation";
	import { authClient } from "$lib/auth-client";
	import Field from "$lib/components/matilha/Field.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card } from "$lib/components/ui/card/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import * as Select from "$lib/components/ui/select/index.js";
	import { orpc } from "$lib/orpc";

	let { switchToSignIn } = $props<{ switchToSignIn: () => void }>();

	const interestLabels: Record<string, string> = {
		building: "Construindo/idealizando",
		observing: "Só observando",
		running: "Já tenho produto rodando",
	};

	const validationSchema = z.object({
		email: z.email("Email inválido"),
		interest: z.enum(["running", "building", "observing"], {
			message: "Escolha uma opção",
		}),
		name: z.string().min(2, "Nome precisa ter pelo menos 2 letras"),
		password: z.string().min(8, "Senha precisa ter pelo menos 8 caracteres"),
		phone: z.string().min(8, "Telefone inválido"),
	});

	const updateSignupDetails = createMutation(() => ({
		...orpc.founders.updateSignupDetails.mutationOptions(),
	}));

	const form = createForm(() => ({
		defaultValues: {
			email: "",
			interest: "" as "" | "running" | "building" | "observing",
			name: "",
			password: "",
			phone: "",
		},
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
					onSuccess: async () => {
						await updateSignupDetails.mutateAsync({
							interest: value.interest as "running" | "building" | "observing",
							phone: value.phone,
						});
						goto("/board");
					},
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

			<form.Field name="phone">
				{#snippet children(field)}
					<Field
						error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
						htmlFor={field.name}
						label="Telefone"
					>
						<Input
							id={field.name}
							name={field.name}
							onblur={field.handleBlur}
							oninput={(e: Event) => field.handleChange((e.target as HTMLInputElement).value)}
							placeholder="(11) 91234-5678"
							type="tel"
							value={field.state.value}
						/>
					</Field>
				{/snippet}
			</form.Field>

			<form.Field name="interest">
				{#snippet children(field)}
					<Field
						error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
						htmlFor={field.name}
						label="Como você está hoje?"
					>
						<Select.Root
							name={field.name}
							onValueChange={(v) => field.handleChange(v as typeof field.state.value)}
							type="single"
							value={field.state.value}
						>
							<Select.Trigger class="w-full" id={field.name}>
								{field.state.value ? interestLabels[field.state.value] : "Selecione"}
							</Select.Trigger>
							<Select.Content>
								<Select.Item label={interestLabels.running} value="running"
									>{interestLabels.running}</Select.Item
								>
								<Select.Item label={interestLabels.building} value="building"
									>{interestLabels.building}</Select.Item
								>
								<Select.Item label={interestLabels.observing} value="observing"
									>{interestLabels.observing}</Select.Item
								>
							</Select.Content>
						</Select.Root>
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
