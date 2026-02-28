<script lang="ts">
	let name = $state('');
	let email = $state('');
	let message = $state('');
	let website = $state(''); // honeypot field: should stay empty for humans
	let formStartedAt = $state(Date.now());
	let status = $state<'idle' | 'sending' | 'success' | 'error'>('idle');

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		status = 'sending';
		try {
			const res = await fetch('/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, website, formStartedAt })
			});
			const data = await res.json();
			if (data.success) {
				status = 'success';
				name = '';
				email = '';
				message = '';
				website = '';
			} else {
				status = 'error';
			}
		} catch {
			status = 'error';
		}
	}
</script>

<svelte:head>
	<title>Contact — Charlie Willis</title>
	<meta name="description" content="Get in touch with Charlie Willis." />
</svelte:head>

<div class="max-w-2xl mx-auto px-4 py-16 sm:py-24">
	<h1 class="text-4xl font-bold text-slate-900 mb-4 dark:text-slate-100">Get in Touch</h1>
	<p class="text-lg text-slate-500 mb-12 dark:text-slate-400">
		Have a project in mind or want to talk shop? Send me a message and I'll get back to you promptly.
	</p>

	{#if status === 'success'}
		<div class="bg-green-50 border border-green-200 rounded-xl p-6 text-center dark:bg-green-500/10 dark:border-green-500/20">
			<div class="text-2xl mb-2">✓</div>
			<h2 class="font-semibold text-green-800 mb-1 dark:text-green-200">Message sent!</h2>
			<p class="text-green-700 text-sm dark:text-green-300">Thanks for reaching out. I'll be in touch soon.</p>
			<button
				onclick={() => {
					status = 'idle';
					formStartedAt = Date.now();
				}}
				class="mt-4 text-sm text-green-600 hover:text-green-700 underline dark:text-green-300 dark:hover:text-green-200"
			>
				Send another message
			</button>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="flex flex-col gap-5">
			<!-- Honeypot field: hidden from users, usually filled by bots -->
			<div class="hidden" aria-hidden="true">
				<label for="website">Website</label>
				<input id="website" type="text" bind:value={website} autocomplete="off" tabindex="-1" />
			</div>

			<div>
				<label for="name" class="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">Name</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					required
					placeholder="Your name"
					class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
				/>
			</div>

			<div>
				<label for="email" class="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">Email</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					placeholder="you@example.com"
					class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
				/>
			</div>

			<div>
				<label for="message" class="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">Message</label>
				<textarea
					id="message"
					bind:value={message}
					required
					rows="6"
					placeholder="Tell me about your project or what you're looking for..."
					class="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
				></textarea>
			</div>

			{#if status === 'error'}
				<p class="text-red-600 text-sm dark:text-red-400">Something went wrong. Please try again or email me directly.</p>
			{/if}

			<button
				type="submit"
				disabled={status === 'sending'}
				class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
			>
				{status === 'sending' ? 'Sending…' : 'Send Message'}
			</button>
		</form>
	{/if}
</div>
