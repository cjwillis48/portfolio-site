<script lang="ts">
	let { skill }: { skill: string } = $props();
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
	{skill}
</span>
