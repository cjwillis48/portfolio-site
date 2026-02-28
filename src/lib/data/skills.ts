import type { SkillGroup } from '$lib/types';

export const skills: SkillGroup[] = [
	{
		category: 'Languages',
		skills: ['Python', 'Java', 'TypeScript', 'PHP']
	},
	{
		category: 'Backend & APIs',
		skills: ['Spring Boot', 'Node.js', 'FastAPI', 'Express', 'Laravel']
	},
	{
		category: 'Cloud & Platform',
		skills: ['AWS', 'Lambda', 'Docker', 'Kubernetes', 'GCP', 'Red Hat OpenShift', 'Cloudflare']
	},
	{
		category: 'Messaging & Integration',
		skills: ['Kafka', 'AWS SQS/SNS', 'GCP Pub/Sub', 'ActiveMQ']
	},
	{
		category: 'Data & Persistence',
		skills: ['PostgreSQL', 'MySQL', 'Redis', 'DynamoDB', 'ETL', 'Couchbase']
	},
	{
		category: 'Observability & Tooling',
		skills: ['GitHub', 'Jenkins', 'Splunk', 'Cloudwatch']
	}
];
