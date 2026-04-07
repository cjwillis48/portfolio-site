<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/Nav.svelte';
	import Footer from '$lib/components/Footer.svelte';

	let { children } = $props();
</script>

<div
	class="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100"
>
	<Nav />
	<main class="flex-1 pt-16">
		{@render children()}
	</main>
	<Footer />
	<iframe
		src="https://ragr.charliewillis.com/chat/chatlie/embed"
		title="Chatlie Widget"
		sandbox="allow-scripts allow-same-origin allow-forms"
		style="position:fixed;bottom:0;right:0;width:450px;height:650px;border:none;z-index:9999;"
	></iframe>
</div>
