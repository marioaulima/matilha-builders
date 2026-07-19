<script lang="ts">
	import { motion } from "@humanspeak/svelte-motion";
	import { cn } from "$lib/utils.js";

	let {
		title = "Configuring your account...",
		subtitle = "Please wait while we prepare everything for you",
		size = "md",
		class: className,
		...restProps
	}: {
		title?: string;
		subtitle?: string;
		size?: "sm" | "md" | "lg";
		class?: string;
		[key: string]: unknown;
	} = $props();

	const sizeConfig = {
		lg: {
			container: "size-40",
			maxWidth: "max-w-64",
			spacing: "space-y-4",
			subtitleClass: "text-base/relaxed",
			titleClass: "text-lg/tight font-semibold",
		},
		md: {
			container: "size-32",
			maxWidth: "max-w-56",
			spacing: "space-y-3",
			subtitleClass: "text-sm/relaxed",
			titleClass: "text-base/snug font-medium",
		},
		sm: {
			container: "size-20",
			maxWidth: "max-w-48",
			spacing: "space-y-2",
			subtitleClass: "text-xs/relaxed",
			titleClass: "text-sm/tight font-medium",
		},
	} as const;

	const config = $derived(sizeConfig[size]);
</script>

<div
	class={cn("flex flex-col items-center justify-center gap-8 p-8", className)}
	{...restProps}
>
	<motion.div
		animate={{ scale: [1, 1.02, 1] }}
		class={cn("relative", config.container)}
		transition={{
			duration: 4,
			ease: [0.4, 0, 0.6, 1],
			repeat: Number.POSITIVE_INFINITY,
		}}
	>
		<motion.div
			animate={{ rotate: [0, 360] }}
			class="absolute inset-0 rounded-full"
			style="background: conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 90deg, transparent 180deg); mask: radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%); opacity: 0.8;"
			transition={{ duration: 3, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, 360] }}
			class="absolute inset-0 rounded-full"
			style="background: conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 120deg, rgba(0, 0, 0, 0.5) 240deg, transparent 360deg); mask: radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%); opacity: 0.9;"
			transition={{ duration: 2.5, ease: [0.4, 0, 0.6, 1], repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, -360] }}
			class="absolute inset-0 rounded-full"
			style="background: conic-gradient(from 180deg, transparent 0deg, rgba(0, 0, 0, 0.6) 45deg, transparent 90deg); mask: radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%); opacity: 0.35;"
			transition={{ duration: 4, ease: [0.4, 0, 0.6, 1], repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, 360] }}
			class="absolute inset-0 rounded-full"
			style="background: conic-gradient(from 270deg, transparent 0deg, rgba(0, 0, 0, 0.4) 20deg, transparent 40deg); mask: radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%); opacity: 0.5;"
			transition={{ duration: 3.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, 360] }}
			class="absolute inset-0 hidden rounded-full dark:block"
			style="background: conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 90deg, transparent 180deg); mask: radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%); opacity: 0.8;"
			transition={{ duration: 3, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, 360] }}
			class="absolute inset-0 hidden rounded-full dark:block"
			style="background: conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 120deg, rgba(255, 255, 255, 0.5) 240deg, transparent 360deg); mask: radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%); opacity: 0.9;"
			transition={{ duration: 2.5, ease: [0.4, 0, 0.6, 1], repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, -360] }}
			class="absolute inset-0 hidden rounded-full dark:block"
			style="background: conic-gradient(from 180deg, transparent 0deg, rgba(255, 255, 255, 0.6) 45deg, transparent 90deg); mask: radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%); opacity: 0.35;"
			transition={{ duration: 4, ease: [0.4, 0, 0.6, 1], repeat: Number.POSITIVE_INFINITY }}
		></motion.div>

		<motion.div
			animate={{ rotate: [0, 360] }}
			class="absolute inset-0 hidden rounded-full dark:block"
			style="background: conic-gradient(from 270deg, transparent 0deg, rgba(255, 255, 255, 0.4) 20deg, transparent 40deg); mask: radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%); -webkit-mask: radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%); opacity: 0.5;"
			transition={{ duration: 3.5, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
		></motion.div>
	</motion.div>

	<motion.div
		animate={{ opacity: 1, y: 0 }}
		class={cn("text-center", config.spacing, config.maxWidth)}
		initial={{ opacity: 0, y: 12 }}
		transition={{ delay: 0.4, duration: 1, ease: [0.4, 0, 0.2, 1] }}
	>
		<motion.h1
			animate={{ opacity: 1, y: 0 }}
			class={cn(
				config.titleClass,
				"font-medium text-black/90 leading-[1.15] tracking-[-0.02em] antialiased dark:text-white/90"
			)}
			initial={{ opacity: 0, y: 12 }}
			transition={{ delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
		>
			<motion.span
				animate={{ opacity: [0.9, 0.7, 0.9] }}
				transition={{ duration: 3, ease: [0.4, 0, 0.6, 1], repeat: Number.POSITIVE_INFINITY }}
			>
				{title}
			</motion.span>
		</motion.h1>

		<motion.p
			animate={{ opacity: 1, y: 0 }}
			class={cn(
				config.subtitleClass,
				"font-normal text-black/60 leading-[1.45] tracking-[-0.01em] antialiased dark:text-white/60"
			)}
			initial={{ opacity: 0, y: 8 }}
			transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
		>
			<motion.span
				animate={{ opacity: [0.6, 0.4, 0.6] }}
				transition={{ duration: 4, ease: [0.4, 0, 0.6, 1], repeat: Number.POSITIVE_INFINITY }}
			>
				{subtitle}
			</motion.span>
		</motion.p>
	</motion.div>
</div>
