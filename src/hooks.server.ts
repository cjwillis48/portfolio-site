import type { HandleServerError } from '@sveltejs/kit';

function createRequestId(): string {
	try {
		return crypto.randomUUID();
	} catch {
		return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
	}
}

export const handleError: HandleServerError = ({ error, event, status, message }) => {
	const requestId = createRequestId();
	const platformCf = event.platform as unknown as { cf?: { ray?: string } } | undefined;
	const cfRay = event.request.headers.get('cf-ray') ?? platformCf?.cf?.ray ?? null;

	console.error(
		'[ssr] Unhandled server error',
		{
			requestId,
			status,
			message,
			path: event.url.pathname,
			method: event.request.method,
			cfRay,
			userAgent: event.request.headers.get('user-agent') ?? null
		},
		error
	);

	return {
		message: 'Internal Error'
	};
};
