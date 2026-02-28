import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;
const MIN_FORM_FILL_MS = 3000;

function isValidContactPayload(payload: unknown): payload is { name: string; email: string; message: string } {
	if (!payload || typeof payload !== 'object') {
		return false;
	}

	const record = payload as Record<string, unknown>;
	const name = typeof record.name === 'string' ? record.name.trim() : '';
	const email = typeof record.email === 'string' ? record.email.trim() : '';
	const message = typeof record.message === 'string' ? record.message.trim() : '';

	return (
		name.length > 0 &&
		name.length <= MAX_NAME_LENGTH &&
		email.length > 0 &&
		email.length <= MAX_EMAIL_LENGTH &&
		EMAIL_REGEX.test(email) &&
		message.length > 0 &&
		message.length <= MAX_MESSAGE_LENGTH
	);
}

export const POST: RequestHandler = async ({ request, platform }) => {
	let payload: unknown;

	try {
		payload = await request.json();
	} catch {
		return json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
	}

	if (!isValidContactPayload(payload)) {
		return json({ success: false, error: 'Please provide a valid name, email, and message.' }, { status: 400 });
	}

	const record = payload as Record<string, unknown>;
	const website = typeof record.website === 'string' ? record.website.trim() : '';
	const formStartedAt = typeof record.formStartedAt === 'number' ? record.formStartedAt : NaN;

	// Silently accept obvious bots so they don't learn validation details.
	if (website.length > 0) {
		return json({ success: true });
	}

	if (!Number.isFinite(formStartedAt) || Date.now() - formStartedAt < MIN_FORM_FILL_MS) {
		return json({ success: false, error: 'Please take a moment and try again.' }, { status: 400 });
	}

	const { name, email, message } = payload;

	// Cloudflare Pages exposes vars via platform.env; local dev uses .env via $env/dynamic/private
	const brevoApiKey = platform?.env?.BREVO_API_KEY ?? env.BREVO_API_KEY;
	const contactFromEmail = platform?.env?.CONTACT_FROM_EMAIL ?? env.CONTACT_FROM_EMAIL;
	const contactToEmail = platform?.env?.CONTACT_TO_EMAIL ?? env.CONTACT_TO_EMAIL;
	const contactFromName = platform?.env?.CONTACT_FROM_NAME ?? env.CONTACT_FROM_NAME ?? 'Portfolio Contact Form';

	if (!brevoApiKey || !contactFromEmail || !contactToEmail) {
		console.error('Contact form is missing required email environment variables.');
		return json({ success: false, error: 'Email service is not configured.' }, { status: 500 });
	}

	const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'api-key': brevoApiKey
		},
		body: JSON.stringify({
			sender: {
				email: contactFromEmail,
				name: contactFromName
			},
			to: [{ email: contactToEmail }],
			replyTo: {
				email,
				name
			},
			subject: `Portfolio contact form submission from ${name}`,
			textContent: `From: ${name} <${email}>\n\n${message}`
		})
	});

	if (!brevoResponse.ok) {
		const responseBody = await brevoResponse.text();
		console.error('Brevo email send failed:', brevoResponse.status, responseBody);
		return json({ success: false, error: 'Failed to send message. Please try again.' }, { status: 502 });
	}

	return json({ success: true });
};
