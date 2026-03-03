import type { Experience } from '$lib/types';

const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
	month: 'long',
	year: 'numeric'
});

function parseYearMonth(value: string): Date | null {
	const normalized = value.trim();
	const match = normalized.match(/^(\d{4})-(\d{2})$/);
	if (!match) {
		return null;
	}

	const year = Number(match[1]);
	const month = Number(match[2]);
	const monthIndex = month - 1;
	if (!Number.isInteger(year) || !Number.isInteger(month) || monthIndex < 0 || monthIndex > 11) {
		return null;
	}

	return new Date(year, monthIndex, 1);
}

export function getYearsOfExperience(jobs: Experience[], now: Date = new Date()): number {
	const earliestStart = jobs.reduce<Date | null>((earliest, job) => {
		const parsed = parseYearMonth(job.start);
		if (!parsed) return earliest;
		if (!earliest || parsed < earliest) return parsed;
		return earliest;
	}, null);

	if (!earliestStart) return 0;

	const yearDiff = now.getFullYear() - earliestStart.getFullYear();
	const monthAdjustment = now.getMonth() < earliestStart.getMonth() ? 1 : 0;

	return Math.max(0, yearDiff - monthAdjustment);
}

export function formatExperienceDate(value: string): string {
	if (value === 'Present') {
		return value;
	}

	const parsed = parseYearMonth(value);
	if (!parsed) {
		return value;
	}

	return DATE_FORMATTER.format(parsed);
}
