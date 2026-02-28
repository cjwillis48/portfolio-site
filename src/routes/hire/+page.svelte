<script lang="ts">
	// Update engagement types and availability status as needed
	import { engagementTypes } from '$lib/data/engagementTypes';
</script>

<svelte:head>
	<title>Hire Me — Charlie Willis</title>
	<meta name="description" content="Charlie Willis is available for software engineering contracts and consulting." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-16 sm:py-24">
	<!-- Header -->
	<div class="mb-16">
		<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-6 dark:bg-green-500/10 dark:text-green-300">
			<span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
			Currently available
		</div>
		<h1 class="text-4xl font-bold text-slate-900 mb-4 dark:text-slate-100">Available for Hire</h1>
		<p class="text-xl text-slate-500 max-w-2xl dark:text-slate-400">
			I take on select engineering contracts with teams that value quality, clear communication,
			and moving thoughtfully at speed.
		</p>
	</div>

	<!-- Engagement types -->
	<section class="mb-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-8 dark:text-slate-100">Engagement Types</h2>
		<div class="flex flex-col gap-4">
			{#each engagementTypes as item}
				<div class="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-start gap-4 dark:bg-slate-900 dark:border-slate-800">
					<div class="flex-1">
						<div class="flex items-center gap-3 mb-2">
							<h3 class="font-semibold text-slate-900 dark:text-slate-100">{item.type}</h3>
							<span class="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium dark:text-green-300 dark:bg-green-500/10">{item.badge}</span>
						</div>
						<p class="text-slate-500 text-sm leading-relaxed dark:text-slate-400">{item.detail}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- How to engage -->
	<section class="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center dark:bg-indigo-500/10 dark:border-indigo-500/20">
		<h2 class="text-2xl font-bold text-slate-900 mb-3 dark:text-slate-100">Ready to Talk?</h2>
		<p class="text-slate-500 mb-6 max-w-lg mx-auto dark:text-slate-300">
			Send me a short note about your project and what kind of help you're looking for.
			I'll respond within one business day.
		</p>
		<a
			href="/contact"
			class="inline-flex px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
		>
			Get in Touch
		</a>
	</section>
</div>
