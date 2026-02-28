<script lang="ts">
	import { page } from '$app/stores';

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/about', label: 'About' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/experience', label: 'Experience' },
		{ href: 'https://blog.charliewillis.com', label: 'Blog' },
		{ href: '/hire', label: 'Hire Me' },
		{ href: '/contact', label: 'Contact' }
	];

	let menuOpen = $state(false);
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-950/95 dark:border-slate-800">
	<div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
		<a href="/" class="font-bold text-slate-900 text-lg tracking-tight hover:text-indigo-600 transition-colors dark:text-slate-100 dark:hover:text-indigo-400">
			Charlie Willis
		</a>

		<!-- Desktop nav -->
		<ul class="hidden md:flex items-center gap-1">
			{#each links as { href, label }}
				<li>
					<a
						{href}
						target={href.startsWith('http') ? '_blank' : undefined}
						rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
						class="px-3 py-2 rounded-md text-sm font-medium transition-colors
						{$page.url.pathname === href
							? 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/10'
							: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800'}"
					>
						{label}
					</a>
				</li>
			{/each}
		</ul>

		<!-- Mobile menu button -->
		<button
			class="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
			onclick={() => (menuOpen = !menuOpen)}
			aria-label="Toggle menu"
		>
			<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if menuOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>

	<!-- Mobile menu -->
	{#if menuOpen}
		<div class="md:hidden border-t border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-950">
			<ul class="flex flex-col gap-1">
				{#each links as { href, label }}
					<li>
						<a
							{href}
							target={href.startsWith('http') ? '_blank' : undefined}
							rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
							onclick={() => (menuOpen = false)}
							class="block px-3 py-2 rounded-md text-sm font-medium transition-colors
							{$page.url.pathname === href
								? 'text-indigo-600 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-500/10'
								: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800'}"
						>
							{label}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</nav>
