import type { Project } from '$lib/types';

export const projects: Project[] = [
	{
		title: 'Marketing Orchestration API',
		description:
			'Led architecture and technical direction for a suite of operational APIs used by engineering teams to replay campaigns, manage runtime configurations, and control Glue jobs in the marketing delivery pipeline. These tools turned one-off manual operations into self-service capabilities, giving teams faster incident response and reducing reliance on ad hoc scripts.',
		tags: [
			'Python',
			'AWS Lambda',
			'AWS DynamoDB',
			'AWS Glue',
			'AWS S3',
			'AWS SQS',
			'REST APIs',
			'Developer Tooling'
		],
		year: '2025-Present'
	},
	{
		title: 'Unified Entry Layer',
		description:
			'Designed and delivered a greenfield asynchronous entry platform for a marketing and messaging data product, supporting both batch and streaming traffic with low-latency guarantees despite synchronous routing constraints. This replaced a tightly-coupled pipeline that had become a scaling bottleneck, establishing the decoupled messaging foundation used across the platform today.',
		tags: [
			'Python',
			'AWS Lambda',
			'AWS SQS',
			'AWS SNS',
			'AWS DynamoDB',
			'AWS Glue',
			'AWS S3',
			'REST APIs'
		],
		year: '2024-2025'
	},
	{
		title: 'Choice Recovery Path Web Application',
		description:
			'Inherited and modernized a HIPAA-compliant, multi-tenant recovery accountability platform with selfie-based sign-in/sign-out, role-based organizational workflows, and mobile-first UX. Executed an incremental API-by-API rewrite, using the existing business logic as a reference while upgrading Laravel 5 to 11 and Angular 4 to LTS, redesigning the data model, automating tenant provisioning, and backfilling the API with 90% automated test coverage.',
		tags: [
			'Laravel',
			'Angular',
			'Filament',
			'MySQL',
			'AWS SES',
			'AWS S3',
			'Docker',
			'Multi-Tenancy'
		],
		year: '2023-Present'
	},
	{
		title: 'Airline Operations Systems Integration Services (AOSIS)',
		description:
			'Led and heavily implemented a full rewrite of mission-critical airline integration middleware, with 20+ microservices bridging legacy and modern systems through ordered, event-driven message flows and a dynamic routing library. This enabled decommissioning of mainframe integrations and provided reliable async flight data to any system in the company that needed it.',
		tags: [
			'Java',
			'Spring Boot',
			'Apache Camel',
			'Red Hat OpenShift',
			'Angular',
			'REST APIs',
			'Event-Driven Architecture',
			'Couchbase'
		],
		year: '2020-2021'
	},
	{
		title: 'Airline Operations Data Store (AODS)',
		description:
			'Built and evolved an operations state platform that reconciled real-time flight and aircraft events into a queryable day-of-operations view, for example when a flight was loaded, departed, and arrived. Replatformed from WebLogic to containers, migrated auth from basic to bearer token, and added sub-minute failover for a system with a 15-minute RTO and zero RPO.',
		tags: [
			'Java',
			'Spring Boot',
			'Apache Camel',
			'Red Hat OpenShift',
			'Angular',
			'REST APIs',
			'Integration',
			'Event-Driven Architecture',
			'Couchbase'
		],
		year: '2021-2022'
	},
	{
		title: 'Airline Fuel Application Support Team (AFAST)',
		description:
			'Architected and delivered core microservices in a fuel-optimization product suite for UPS Airlines, including message-driven integrations for aircraft engine start/stop telemetry. As the sole senior engineer, served as de facto technical lead across architecture, implementation, and delivery for a product suite saving an estimated $20M annually in fuel costs.',
		tags: [
			'Java',
			'Spring Boot',
			'Red Hat OpenShift',
			'Microservices',
			'SQL Server',
			'Python',
			'Angular',
			'Integration'
		],
		year: '2019'
	}
];
