import type { EngagementType } from '$lib/types';

export const engagementTypes: EngagementType[] = [
	{
		type: 'Full-Time Roles',
		detail: "Open to the right full-time opportunity with a strong engineering culture. Remote preferred, eastern time zone.",
		badge: 'Selectively open'
	},
	{
		type: 'Contract / Freelance',
		detail:
			'Part time project work in off-hours, evenings, or weekends. Best for specific features, migrations, a quick project, or a technical refresh.',
		badge: 'Open to this'
	},
	{
		type: 'Websites',
		detail:
			'Website design and development. Great for small businesses or personal projects. You provide the content, I build the site.',
		badge: 'Open to this'
	},
	{
		type: 'Technical Consulting',
		detail:
			'Architecture reviews, code audits, technical strategy, or a second opinion before a major engineering decision.',
		badge: 'Open to this'
	}
];

