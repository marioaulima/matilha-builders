<script lang="ts">
	import { createMutation } from "@tanstack/svelte-query";
	import Field from "$lib/components/matilha/Field.svelte";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Card } from "$lib/components/ui/card/index.js";
	import { Textarea } from "$lib/components/ui/textarea/index.js";
	import { orpc } from "$lib/orpc";

	let progress = $state("");
	let blocked = $state("");
	let help = $state("");

	const postCheckIn = createMutation(() =>
		orpc.checkIns.create.mutationOptions()
	);

	function submit(e: SubmitEvent) {
		e.preventDefault();
		postCheckIn.mutate({ blocked, help: help || undefined, progress });
	}
</script>

{#if postCheckIn.isSuccess}
	<div class="mx-auto max-w-[520px] px-4 py-12 text-center">
		<div class="font-mono text-[28px] font-bold text-streak">
			{postCheckIn.data.streak}
			{postCheckIn.data.streak === 1 ? "semana" : "semanas"}
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			Check-in postado. Streak mantido.
		</p>
		<Button class="mt-4" href="/feed" variant="outline">Ver o feed</Button>
	</div>
{:else}
	<div class="mx-auto max-w-[520px] px-4 py-6">
		<h1 class="mb-1 text-2xl font-bold">Check-in da semana</h1>
		<p class="mb-5 text-sm text-muted-foreground">
			Curto e sem frescura. Nada é obrigatório.
		</p>
		<Card class="border border-border p-4">
			<form class="flex flex-col gap-4" onsubmit={submit}>
				<Field label="O que avançou essa semana">
					<Textarea
						placeholder="Shipei, vendi, aprendi..."
						rows={3}
						bind:value={progress}
					/>
				</Field>
				<Field label="O que travou">
					<Textarea
						placeholder="O que te segurou"
						rows={3}
						bind:value={blocked}
					/>
				</Field>
				<Field hint="opcional" label="No que precisa de ajuda">
					<Textarea
						placeholder="A matilha te ajuda"
						rows={2}
						bind:value={help}
					/>
				</Field>
				<Button disabled={postCheckIn.isPending} type="submit">
					{postCheckIn.isPending ? "Postando..." : "Postar"}
				</Button>
			</form>
		</Card>
	</div>
{/if}
