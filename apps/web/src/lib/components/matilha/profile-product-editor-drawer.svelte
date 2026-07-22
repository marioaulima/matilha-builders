<script lang="ts">
	import {
		Drawer,
		DrawerClose,
		DrawerContent,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle,
	} from "$lib/components/ui/drawer/index.js";
	import type { ProductFormValues } from "./profile-product.types.js";
	import ProfileProductEditor from "./profile-product-editor.svelte";

	let {
		open = $bindable(false),
		initialValues,
		onSave,
	}: {
		open?: boolean;
		initialValues: ProductFormValues;
		onSave: (value: ProductFormValues) => void | Promise<void>;
	} = $props();
</script>

<Drawer bind:open>
	<DrawerContent>
		<div class="mx-auto w-full max-w-md">
			<DrawerHeader>
				<DrawerTitle>Editar produto</DrawerTitle>
			</DrawerHeader>
			<div class="px-4 pb-2">
				<!-- Mount only while open so the form re-inits with the current
				     product's values each time — createForm reads defaultValues
				     once, so a persistent mount would keep the first product's data. -->
				{#if open}
					<ProfileProductEditor
						{initialValues}
						onSubmit={onSave}
						submitLabel="Salvar"
					/>
				{/if}
			</div>
			<DrawerFooter>
				<DrawerClose
					class="h-9 w-full rounded-md border border-border text-sm transition-colors hover:bg-accent"
				>
					Cancelar
				</DrawerClose>
			</DrawerFooter>
		</div>
	</DrawerContent>
</Drawer>
