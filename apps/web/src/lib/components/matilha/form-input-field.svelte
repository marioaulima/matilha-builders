<script lang="ts">
	import { Input } from "$lib/components/ui/input/index.js";
	import Field from "./field.svelte";

	interface FormField {
		handleBlur: () => void;
		handleChange: (value: string) => void;
		name: string;
		state: {
			meta: {
				errors: Array<{ message?: string } | undefined>;
				isTouched: boolean;
			};
			value: string;
		};
	}

	let {
		field,
		label,
		placeholder,
		type = "text",
		hint,
	}: {
		field: FormField;
		label: string;
		placeholder?: string;
		type?: "email" | "password" | "tel" | "text";
		hint?: string;
	} = $props();

	function maskPhoneBR(value: string): string {
		const digits = value.replace(/\D/g, "").slice(0, 11);
		const ddd = digits.slice(0, 2);
		const rest = digits.slice(2);

		if (digits.length <= 2) {
			return digits.length ? `(${ddd}` : "";
		}
		if (digits.length <= 6) {
			return `(${ddd}) ${rest}`;
		}
		if (digits.length <= 10) {
			return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
		}
		return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const value = type === "tel" ? maskPhoneBR(target.value) : target.value;
		target.value = value;
		field.handleChange(value);
	}
</script>

<Field
	error={field.state.meta.isTouched ? field.state.meta.errors[0]?.message : undefined}
	{hint}
	htmlFor={field.name}
	{label}
>
	<Input
		id={field.name}
		name={field.name}
		onblur={field.handleBlur}
		oninput={handleInput}
		{placeholder}
		{type}
		value={field.state.value}
	/>
</Field>
