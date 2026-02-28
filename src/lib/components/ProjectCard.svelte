<script lang="ts">
	import type { Project } from '$lib/types';
	import SkillBadge from './SkillBadge.svelte';

	let { project }: { project: Project } = $props();
</script>

<div class="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-slate-950/40">
	<div class="flex items-start justify-between gap-2">
		<h3 class="font-semibold text-slate-900 text-lg leading-snug dark:text-slate-100">{project.title}</h3>
		<span class="text-xs text-slate-400 font-medium shrink-0 mt-1 dark:text-slate-500">{project.year}</span>
	</div>

	<p class="text-slate-600 text-sm leading-relaxed dark:text-slate-300">{project.description}</p>

	<div class="flex flex-wrap gap-2 mt-auto">
		{#each project.tags as tag}
			<SkillBadge skill={tag} />
		{/each}
	</div>
</div>
