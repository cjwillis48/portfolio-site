export interface Project {
	title: string;
	description: string;
	tags: string[]; // tech used
	year: string; // e.g. "2024-2025" or "2025-Present"
}

export interface Experience {
	company: string;
	role: string;
	start: string; // e.g. "2021-01"
	end: string | 'Present'; // e.g. "2024-06" or "Present"
	bullets: string[];
	tags: string[];
}

export interface SkillGroup {
	category: string; // e.g. "Languages", "Cloud", "Databases"
	skills: string[];
}

export interface EngagementType {
	type: string;
	detail: string;
	badge: string;
}

export interface ChatbotConfig {
	modelSlug: string;
}
