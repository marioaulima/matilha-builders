<script lang="ts">
	import { Input } from "$lib/components/ui/input/index.js";
	import Field from "./Field.svelte";

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
		oninput={(event: Event) => field.handleChange((event.target as HTMLInputElement).value)}
		{placeholder}
		{type}
		value={field.state.value}
	/>
</Field>
