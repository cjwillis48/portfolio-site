import type { Experience } from '$lib/types';

export const experience: Experience[] = [
	{
		company: 'Capital One',
		role: 'Senior Software Engineer',
		start: 'December 2022',
		end: 'Present',
		bullets: [
			'Delivered capabilities on a high-throughput messaging orchestration platform, processing 100s of millions of messages per day.',
			'Architected and led delivery of the greenfield Unified Entry Layer (UEL) platform from concept to production, establishing the decoupled messaging foundation used by the Capital One marketing data platform.',
			'Architected and led delivery of the Marketing Orchestration API platform, enabling runtime configuration retrieval, message replay, Glue job management, and more to enable operational excellence for the marketing data platform.',
		],
		tags: ['Java', 'Spring Boot', 'Kafka', 'SNS/SQS', 'Lambda', 'DynamoDB', 'Python', 'Microservices', 'API', 'Messaging', 'Orchestration']
	},
	{
		company: 'Choice Recovery Path',
		role: 'Principal Engineer (Contract)',
		start: 'December 2023',
		end: 'Present',
		bullets: [
			'Inherited a legacy PHP application and migrated it to modern PHP 8.4, Laravel 12, and MySQL 8.0.',
			'Redesigned the data model and added asynchronous workload processing with timed jobs to improve performance and scalability, reducing database queries and improving the overall user experience.',
			'Completed a full codebase refactor following best practices, with 90% automated test coverage.'
		],
		tags: ['PHP', 'Laravel', 'HIPAA Compliant', 'MySQL', 'Angular', 'Docker']
	},
	{
		company: 'UPS',
		role: 'Application Architect',
		start: 'April 2022',
		end: 'November 2022',
		bullets: [
			'Helped shape the UPS enterprise data strategy by defining authoritative data sources across key business domains.',
			'Partnered with infrastructure and security architects to design a secure GCP footprint that could be treated as an intranet data center, leveraging Interconnect, Private Service Connect, and VPC networking.',
			'Led application migration designs from on-premise environments to GCP with a focus on security, reliability, and long-term maintainability.'
		],
		tags: ['Java', 'Spring Boot', 'Google Cloud Platform', 'Architecture', 'Data Strategy']
	},
	{
		company: 'UPS',
		role: 'Lead Application Developer',
		start: 'February 2020',
		end: 'April 2022',
		bullets: [
			'Led a development team building a suite of integration applications for the UPS airline, providing both on-demand and event-driven integrations for internal and vendor systems.',
			'Designed and delivered a mission-critical stateless messaging broker for the airline, composed of 20+ microservices running as Docker containers orchestrated by Kubernetes in Red Hat OpenShift.',
			'Enabled decommissioning of legacy mainframe integrations by introducing a modern, fault-tolerant microservice architecture for flight operations data.',
			'Drove adoption of test-driven development, achieving 90%+ unit test coverage and 100% integration test coverage on event-driven flows.',
			'Created shared libraries and infrastructure, including a reusable test automation framework, a dynamic message routing library, and a configurable API gateway image supporting Azure AD auth.'
		],
		tags: [
			'Java',
			'Spring Boot',
			'Red Hat OpenShift',
			'ActiveMQ',
			'Integration',
			'JMS',
			'Microservices',
			'TDD'
		]
	},
	{
		company: 'UPS',
		role: 'Senior Application Developer',
		start: 'January 2019',
		end: 'February 2020',
		bullets: [
			'Served as full-stack engineer, DevOps build engineer, and informal team lead on a suite of applications reducing jet fuel consumption for the UPS airline.',
			'Contributed to products that save an estimated $20M annually in fuel costs while materially reducing jet-fuel emissions.',
			'Designed microservice architectures for new greenfield applications in an Agile Scrum environment.'
		],
		tags: ['Java', 'Spring Boot', 'Angular', 'Jenkins', 'Microservices', 'Red Hat OpenShift', 'DevOps']
	},
	{
		company: 'UPS',
		role: 'Intermediate Application Developer',
		start: 'October 2016',
		end: 'January 2019',
		bullets: [
			'Modernized aircraft parts inventory management by replatforming a warehouse scanning system from Citrix to native handheld devices, improving reliability for daily maintenance operations.',
			'Identified and eliminated a business-critical risk by migrating a parts-movement tracking workflow from an ad hoc Outlook folder process into a purpose-built web application within the team\'s owned suite of tools.',
			'Worked closely with operations stakeholders to refine requirements and streamline maintenance workflows.'
		],
		tags: ['Java', 'Spring', '.NET', '.NET MVC', 'C#', 'SQL Server']
	},
	{
		company: 'UPS',
		role: 'Application Developer',
		start: 'May 2015',
		end: 'October 2016',
		bullets: [
			'Developed integrations and message flows on a messaging broker for the UPS ground transportation division.',
			'Implemented reliable, fault-tolerant messaging patterns to support high-volume ground operations.',
			'Collaborated with senior engineers to adopt best practices around monitoring, alerting, and incident response for integration services.'
		],
		tags: ['Java', 'JMS', 'ActiveMQ', 'Apache Camel', 'Integration']
	}
];
