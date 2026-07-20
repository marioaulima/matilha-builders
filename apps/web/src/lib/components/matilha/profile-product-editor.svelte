<script lang="ts">
	import { createForm } from "@tanstack/svelte-form";
	import { z } from "zod";
	import { Button } from "$lib/components/ui/button/index.js";
	import FormInputField from "./form-input-field.svelte";
	import FormTextareaField from "./form-textarea-field.svelte";
	import type { ProductFormValues } from "./profile-product.types.js";

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

	let {
		initialValues,
		submitLabel,
		onSubmit,
		onCancel,
	}: {
		initialValues: ProductFormValues;
		submitLabel: string;
		onSubmit: (value: ProductFormValues) => void | Promise<void>;
		onCancel?: () => void;
	} = $props();

	const form = createForm(() => ({
		defaultValues: initialValues,
		onSubmit: async ({ value }) => {
			await onSubmit(value);
		},
		validators: { onSubmit: productSchema },
	}));

	type SubmitState = Pick<typeof form.state, "canSubmit" | "isSubmitting">;
</script>

<form
	class="flex flex-col gap-3"
	onsubmit={(event) => {
		event.preventDefault();
		event.stopPropagation();
		form.handleSubmit();
	}}
>
	<form.Field name="name">
		{#snippet children(field)}
			<FormInputField
				{field}
				label="Nome do produto"
				placeholder="ex: Matilha Builders"
			/>
		{/snippet}
	</form.Field>
	<form.Field name="link">
		{#snippet children(field)}
			<FormInputField
				{field}
				hint="opcional"
				label="Link"
				placeholder="https://..."
			/>
		{/snippet}
	</form.Field>
	<form.Field name="icp">
		{#snippet children(field)}
			<FormTextareaField
				{field}
				hint="opcional"
				label="ICP"
				placeholder="Quem é o cliente ideal desse produto"
				rows={2}
				showError={false}
			/>
		{/snippet}
	</form.Field>
	<form.Field name="painPoint">
		{#snippet children(field)}
			<FormTextareaField
				{field}
				hint="opcional"
				label="Dor a ser resolvida"
				placeholder="Qual problema esse produto resolve"
				rows={2}
				showError={false}
			/>
		{/snippet}
	</form.Field>
	<form.Field name="solution">
		{#snippet children(field)}
			<FormTextareaField
				{field}
				hint="opcional"
				label="Solução"
				placeholder="Como o produto resolve essa dor"
				rows={2}
				showError={false}
			/>
		{/snippet}
	</form.Field>
	<div class="flex gap-2">
		<form.Subscribe
			selector={(state: typeof form.state): SubmitState => ({
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
					{state.isSubmitting ? "Salvando..." : submitLabel}
				</Button>
			{/snippet}
		</form.Subscribe>
		{#if onCancel}
			<Button onclick={onCancel} size="sm" type="button" variant="outline"
				>Cancelar</Button
			>
		{/if}
	</div>
</form>
