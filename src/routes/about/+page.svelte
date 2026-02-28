<script lang="ts">
	// Update bio, background, and photo
	import { experience } from '$lib/data/experience';
	import { howIWork } from '$lib/data/howIWork';
	import { getYearsOfExperience } from '$lib/utils/experience';

	const yearsOfExperience = getYearsOfExperience(experience);
</script>

<svelte:head>
	<title>About — Charlie Willis</title>
	<meta
		name="description"
		content="About Charlie Willis — software engineer, background, and values."
	/>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 py-16 sm:py-24">
	<h1 class="text-4xl font-bold text-slate-900 mb-4 dark:text-slate-100">About Me</h1>
	<p class="text-lg text-slate-500 mb-12 dark:text-slate-400">How I work, what I build, and what matters to me outside of work.</p>

	<div class="grid md:grid-cols-3 gap-12">
		<!-- Profile photo -->
		<div class="md:col-span-1">
			<div
				class="aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
			>
				<img
					src="/images/profile.jpg"
					alt="Portrait of Charlie Willis"
					class="w-full h-full object-cover"
					loading="lazy"
					decoding="async"
				/>
			</div>
		</div>

		<!-- Bio -->
		<div
			class="md:col-span-2 flex flex-col gap-6 text-slate-600 leading-relaxed dark:text-slate-300"
		>
			<p>
				I'm a software engineer with {yearsOfExperience}+ years of experience building backend
				systems, event-driven architectures, and RESTful APIs, but I can work my way around the
				front end as well. I care about writing clean, maintainable, and scalable code that's easy
				to reason about, while balancing being future-proof with shipping speed.
			</p>
			<p>
				I'm passionate about team building and culture building. I believe we can have fun in our
				jobs, grow our skillsets together, thrive as a team, and ship amazing products.
			</p>
			<p>
				Outside of work, I live in Sellersburg, Indiana (just pretend I'm saying Louisville,
				Kentucky), with my wife, daughter, moose-sized dog, and cat. My favorite hobby is playing
				music, especially guitar. There's an unmatched euphoria when you can play a
				song you once thought not possible, and for me, there's no better creative expression than music.
			</p>
			<p>
				I also love grilling and smoking meats, playing video games, and spending time with my
				family. My main passion is spending time with my daughter, watching her learn and grow,
				and showing up in ways I never could have imagined (imposter syndrome is real, even in
				parenting).
			</p>

			<div class="flex gap-3 pt-2">
				<a
					href="/projects"
					class="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-sm"
				>
					See My Projects
				</a>
				<a
					href="/contact"
					class="px-5 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
				>
					Get in Touch
				</a>
			</div>
		</div>
	</div>

	<!-- Outside of work -->
	<div class="mt-16">
		<h2 class="text-2xl font-bold text-slate-900 mb-6 dark:text-slate-100">Outside of Work</h2>
		<div class="grid sm:grid-cols-3 gap-4">
			<figure class="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
				<img
					src="/images/about-daughter-dog.jpg"
					alt="Charlie with daughter and dog"
					class="w-full aspect-[4/3] object-cover"
					loading="lazy"
					decoding="async"
				/>
				<figcaption class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
					Family time with my daughter and our moose-sized dog.
				</figcaption>
			</figure>

			<figure class="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
				<img
					src="/images/about-guitar.jpg"
					alt="Charlie with guitar"
					class="w-full aspect-[4/3] object-cover object-[center_34%]"
					loading="lazy"
					decoding="async"
				/>
				<figcaption class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
					My favorite expression of creativity.
				</figcaption>
			</figure>

			<figure class="bg-white border border-slate-200 rounded-xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
				<img
					src="/images/about-family.jpg"
					alt="Charlie with family"
					class="w-full aspect-[4/3] object-cover object-[42%_42%]"
					loading="lazy"
					decoding="async"
				/>
				<figcaption class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
					My favorite role is being a husband and dad.
				</figcaption>
			</figure>
		</div>
	</div>

	<!-- Values -->
	<div class="mt-20">
		<h2 class="text-2xl font-bold text-slate-900 mb-8 dark:text-slate-100">How I Work</h2>
		<div class="grid sm:grid-cols-2 gap-6">
			{#each howIWork as item}
				<div
					class="bg-white border border-slate-200 rounded-xl p-6 dark:bg-slate-900 dark:border-slate-800"
				>
					<h3 class="font-semibold text-slate-900 mb-2 dark:text-slate-100">{item.title}</h3>
					<p class="text-slate-500 text-sm leading-relaxed dark:text-slate-400">{item.body}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
