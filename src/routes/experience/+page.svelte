<script lang="ts">
	import SkillBadge from '$lib/components/SkillBadge.svelte';
	import { experience } from '$lib/data/experience';
	import { skills } from '$lib/data/skills';
</script>

<svelte:head>
	<title>Experience — Charlie Willis</title>
	<meta name="description" content="Work history and technical skills of Charlie Willis." />
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-16 sm:py-24">
	<h1 class="text-4xl font-bold text-slate-900 mb-4 dark:text-slate-100">Experience</h1>
	<p class="text-lg text-slate-500 mb-16 dark:text-slate-400">Where I've worked and what I've built.</p>

	<!-- Timeline -->
	<section class="mb-20">
		<h2 class="text-2xl font-bold text-slate-900 mb-8 dark:text-slate-100">Work History</h2>
		<div class="flex flex-col gap-0">
			{#each experience as job, i}
				<div class="relative pl-8 pb-10 {i < experience.length - 1 ? 'border-l-2 border-slate-200 dark:border-slate-700' : ''}">
					<!-- Dot -->
					<div class="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200 -translate-x-[9px] dark:border-slate-950 dark:ring-indigo-400/40"></div>

					<div class="bg-white border border-slate-200 rounded-xl p-6 dark:bg-slate-900 dark:border-slate-800">
						<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
							<h3 class="font-semibold text-slate-900 text-lg dark:text-slate-100">{job.role}</h3>
							<span class="text-sm text-slate-400 shrink-0 dark:text-slate-500">{job.start} – {job.end}</span>
						</div>
						<p class="text-indigo-600 font-medium text-sm mb-4 dark:text-indigo-300">{job.company}</p>

						<ul class="flex flex-col gap-2 mb-4">
							{#each job.bullets as bullet}
								<li class="text-slate-600 text-sm leading-relaxed flex gap-2 dark:text-slate-300">
									<span class="text-slate-300 mt-1.5 shrink-0 dark:text-slate-600">▸</span>
									{bullet}
								</li>
							{/each}
						</ul>

						<div class="flex flex-wrap gap-2">
							{#each job.tags as tag}
								<SkillBadge skill={tag} />
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Skills grid -->
	<section>
		<h2 class="text-2xl font-bold text-slate-900 mb-8 dark:text-slate-100">Skills</h2>
		<div class="grid sm:grid-cols-2 gap-6">
			{#each skills as group}
				<div class="bg-white border border-slate-200 rounded-xl p-6 dark:bg-slate-900 dark:border-slate-800">
					<h3 class="font-semibold text-slate-900 text-sm uppercase tracking-wide mb-4 dark:text-slate-100">{group.category}</h3>
					<div class="flex flex-wrap gap-2">
						{#each group.skills as skill}
							<SkillBadge {skill} />
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
