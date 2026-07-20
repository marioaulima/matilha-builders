<script lang="ts">
	import {
		COUNTRIES,
		type Country,
		DEFAULT_COUNTRY,
		findCountryByIso,
		flagFromIso,
		splitE164,
	} from "@matilha-builders/api/lib/countries";
	import { formatBrNational } from "@matilha-builders/api/lib/phone";
	import { untrack } from "svelte";
	import { Input } from "$lib/components/ui/input/index.js";
	import {
		Content as SelectContent,
		Item as SelectItem,
		Root as SelectRoot,
		Trigger as SelectTrigger,
	} from "$lib/components/ui/select/index.js";
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
		hint,
	}: {
		field: FormField;
		label: string;
		hint?: string;
	} = $props();

	const initial = untrack(() => splitE164(field.state.value));
	let countryIso = $state(initial.iso);
	let national = $state(
		maskNational(
			initial.national,
			findCountryByIso(initial.iso) ?? DEFAULT_COUNTRY
		)
	);

	const country = $derived(findCountryByIso(countryIso) ?? DEFAULT_COUNTRY);

	const hasError = $derived(
		field.state.meta.isTouched && Boolean(field.state.meta.errors[0]?.message)
	);
	const describedBy = $derived.by(() => {
		if (hasError) {
			return `${field.name}-error`;
		}
		if (hint) {
			return `${field.name}-hint`;
		}
	});

	// Brazil shows the "(DD) NNNNN-NNNN" mask; other countries keep raw digits,
	// capped so the full E.164 number stays within its 15-digit limit.
	function maskNational(digits: string, forCountry: Country): string {
		if (forCountry.iso === "BR") {
			return formatBrNational(digits);
		}
		const maxNational = 15 - forCountry.dial.length;
		return digits.slice(0, maxNational);
	}

	function emit() {
		const digits = national.replace(/\D/g, "");
		field.handleChange(digits ? `+${country.dial}${digits}` : "");
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const digits = target.value.replace(/\D/g, "");
		national = maskNational(digits, country);
		target.value = national;
		emit();
	}

	function handleCountryChange(iso: string) {
		countryIso = iso;
		// Re-mask the existing number under the new country's rules.
		national = maskNational(
			national.replace(/\D/g, ""),
			findCountryByIso(iso) ?? DEFAULT_COUNTRY
		);
		emit();
	}

	const placeholder = $derived(
		countryIso === "BR" ? "(11) 91234-5678" : "Número de telefone"
	);
</script>

<Field
	error={field.state.meta.isTouched
		? field.state.meta.errors[0]?.message
		: undefined}
	{hint}
	htmlFor={field.name}
	{label}
>
	<div class="flex gap-2">
		<SelectRoot
			onValueChange={handleCountryChange}
			type="single"
			value={countryIso}
		>
			<SelectTrigger
				aria-invalid={hasError}
				aria-label="País (código do telefone)"
				class="shrink-0"
			>
				<span>{flagFromIso(country.iso)}</span>
				<span>+{country.dial}</span>
			</SelectTrigger>
			<SelectContent class="max-h-72">
				{#each COUNTRIES as option (option.iso)}
					<SelectItem
						label={`${option.name} +${option.dial}`}
						value={option.iso}
					>
						<span>{flagFromIso(option.iso)}</span>
						<span class="flex-1">{option.name}</span>
						<span class="text-muted-foreground">+{option.dial}</span>
					</SelectItem>
				{/each}
			</SelectContent>
		</SelectRoot>

		<Input
			aria-describedby={describedBy}
			aria-invalid={hasError}
			autocomplete="tel-national"
			class="flex-1"
			id={field.name}
			inputmode="tel"
			name={field.name}
			onblur={field.handleBlur}
			oninput={handleInput}
			{placeholder}
			type="tel"
			value={national}
		/>
	</div>
</Field>
