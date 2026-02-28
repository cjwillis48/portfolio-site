import type { Experience } from '$lib/types';

export function getYearsOfExperience(jobs: Experience[], now: Date = new Date()): number {
	const earliestStart = jobs.reduce<Date | null>((earliest, job) => {
		const parsed = new Date(`${job.start} 1`);
		if (Number.isNaN(parsed.getTime())) return earliest;
		if (!earliest || parsed < earliest) return parsed;
		return earliest;
	}, null);

	if (!earliestStart) return 0;

	const yearDiff = now.getFullYear() - earliestStart.getFullYear();
	const monthAdjustment = now.getMonth() < earliestStart.getMonth() ? 1 : 0;

	return Math.max(0, yearDiff - monthAdjustment);
}
