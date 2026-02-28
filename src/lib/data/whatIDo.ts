export interface WhatIDoItem {
	title: string;
	body: string;
}

// TODO: Temporarily hidden from `/hire` for MVP launch. Revisit after shipping MVP.
export const whatIDo: WhatIDoItem[] = [
	{
		title: 'Backend Engineering',
		body: 'API design, microservices architecture, event-driven architectures, message-oriented middleware, performance optimization, and data pipelines.'
	},
	{
		title: 'Platform & Infrastructure',
		body: 'AWS, CI/CD pipelines, containerization, and the internal tooling that makes engineering teams faster.'
	},
	{
		title: 'Technical Leadership',
		body: 'Architecture reviews, engineering process improvements, and team building. I can embed as a senior engineer or advise at a higher level.'
	},
	{
		title: 'Full-Stack Development',
		body: "When a project needs product work end-to-end, I'm comfortable taking it from API to UI, including what you're looking at right now."
	}
];
