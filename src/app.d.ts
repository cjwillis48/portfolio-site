// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		interface Platform {
			env: {
				BREVO_API_KEY: string;
				CONTACT_FROM_EMAIL: string;
				CONTACT_TO_EMAIL: string;
				CONTACT_FROM_NAME?: string;
			};
		}
	}
}

export {};
