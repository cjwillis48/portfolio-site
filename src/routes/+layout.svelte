<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
	let ChatComponent = $state<null | typeof import('$lib/components/Chat.svelte').default>(null);

	onMount(async () => {
		const module = await import('$lib/components/Chat.svelte');
		ChatComponent = module.default;
	});
</script>

<div
	class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
>
	<Nav />
	<main class="flex-1 pt-16">
		{@render children()}
	</main>
	<Footer />
	{#if browser && ChatComponent}
		<ChatComponent />
	{/if}
</div>
