<script lang="ts">
	import ProjectCard from '$lib/components/ProjectCard.svelte';
	import { projects } from '$lib/data/projects';
</script>

<svelte:head>
	<title>Projects — Charlie Willis</title>
	<meta name="description" content="Case studies and projects by Charlie Willis." />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 py-16 sm:py-24">
	<div class="mb-12">
		<h1 class="text-4xl font-bold text-slate-900 mb-4 dark:text-slate-100">Projects</h1>
		<p class="text-lg text-slate-500 max-w-2xl dark:text-slate-400">
			Most of my work is in private repositories, so these are concise summaries of the
			systems I built, the decisions I led, and the outcomes delivered.
		</p>
	</div>

	<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
		{#each projects as project}
			<ProjectCard {project} />
		{/each}
	</div>

	{#if projects.length === 0}
		<p class="text-slate-400 text-center py-16 dark:text-slate-500">Case studies coming soon.</p>
	{/if}
</div>
