<script lang="ts">
	// Hero page — update name, title, and tagline to match your brand
</script>

<svelte:head>
	<title>Charlie Willis — Software Engineer</title>
	<meta name="description" content="Software engineer building scalable backend systems. Product-first mindset, bias for shipping." />
</svelte:head>

<section class="relative overflow-hidden">
	<img
		src="/images/hero.webp"
		alt=""
		aria-hidden="true"
		class="absolute inset-0 w-full h-full object-cover object-center"
	/>
	<div class="absolute inset-0 bg-slate-950/60"></div>

	<div class="relative z-10 max-w-6xl mx-auto px-4 py-24 sm:py-32 flex flex-col items-start gap-6">
		<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-sm font-medium">
			<span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
			Interested in exploring new opportunities
		</div>

		<h1 class="text-5xl sm:text-6xl font-bold text-white leading-tight">
			I'm Charlie Willis
		</h1>

		<p class="text-xl sm:text-2xl text-slate-100 max-w-2xl leading-relaxed">
			I build scalable <span class="text-white font-semibold">backend systems</span>, with a product-first mindset and a bias for shipping.
		</p>

		<p class="text-lg text-slate-200 max-w-xl leading-relaxed">
			I help teams ship reliable software that scales, and I stick around to watch them grow.
			See my <a href="/projects" class="text-indigo-200 hover:text-indigo-100 transition-colors underline underline-offset-2">projects</a> and <a href="/experience" class="text-indigo-200 hover:text-indigo-100 transition-colors underline underline-offset-2">experience</a> for the details.
		</p>

		<div class="flex flex-wrap gap-3 pt-2">
			<a
				href="/projects"
				class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
			>
				View My Work
			</a>
			<a
				href="/hire"
				class="px-6 py-3 bg-white text-slate-900 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
			>
				Hire Me
			</a>
			<a
				href="https://blog.charliewillis.com"
				class="px-6 py-3 bg-white text-slate-900 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
			>
				Blog
			</a>
			<a
				href="/contact"
				class="px-6 py-3 text-slate-200 font-medium hover:text-white transition-colors"
			>
				Get in Touch →
			</a>
		</div>
	</div>
</section>
