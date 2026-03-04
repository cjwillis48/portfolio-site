import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { chatbotConfig } from '$lib/data/chatbot';
import { createRequestId } from '$lib/utils/request';
import type { RequestHandler } from './$types';

const MIN_QUESTION_LENGTH = 1;
const MAX_QUESTION_LENGTH = 2000;
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,63}$/;
const DEFAULT_MODEL_NAME = 'Chat Assistant';
const DEFAULT_MODEL_GREETING = 'Hi! Ask me anything about Charlie.';
const DEFAULT_MODEL_PLACEHOLDER = 'Ask a question...';

interface PublicModelInfo {
	name: string;
	slug: string;
	description: string;
	greeting: string;
	placeholder: string;
}

interface ChatHistoryMessage {
	role: 'user' | 'assistant';
	content: string;
}

function logRagrError(message: string, context: Record<string, unknown>, error?: unknown): void {
	if (error) {
		console.error(`[ragr] ${message}`, context, error);
		return;
	}

	console.error(`[ragr] ${message}`, context);
}

function readString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

function isValidQuestion(question: string): boolean {
	return question.length >= MIN_QUESTION_LENGTH && question.length <= MAX_QUESTION_LENGTH;
}

function isValidSlug(slug: string): boolean {
	return SLUG_REGEX.test(slug);
}

function mapUpstreamError(status: number): { status: number; error: string } {
	if (status === 404) {
		return { status: 404, error: 'The requested chat model is unavailable right now.' };
	}

	if (status === 422) {
		return { status: 422, error: 'The chat request was rejected as invalid.' };
	}

	if (status === 429) {
		return {
			status: 429,
			error: 'This chat model is temporarily over capacity. Please try again later.'
		};
	}

	return { status: 502, error: 'Unable to reach the chat service right now. Please try again.' };
}

function readChatConfig(platform?: App.Platform): { baseUrl: string; slug: string } {
	const baseUrl = readString(platform?.env?.RAGR_BASE_URL ?? env.RAGR_BASE_URL);
	const slug = readString(chatbotConfig.modelSlug || 'grandma');
	return { baseUrl, slug };
}

function readModelInfo(payload: unknown, fallbackSlug: string): PublicModelInfo {
	if (!payload || typeof payload !== 'object') {
		return {
			name: DEFAULT_MODEL_NAME,
			slug: fallbackSlug,
			description: '',
			greeting: DEFAULT_MODEL_GREETING,
			placeholder: DEFAULT_MODEL_PLACEHOLDER
		};
	}

	const record = payload as Record<string, unknown>;
	const slug = readString(record.slug) || fallbackSlug;
	return {
		name: readString(record.name) || DEFAULT_MODEL_NAME,
		slug,
		description: readString(record.description),
		greeting: readString(record.greeting) || DEFAULT_MODEL_GREETING,
		placeholder: readString(record.placeholder) || DEFAULT_MODEL_PLACEHOLDER
	};
}

function readHistory(value: unknown): ChatHistoryMessage[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value
		.slice(-20)
		.map((item): ChatHistoryMessage | null => {
			if (!item || typeof item !== 'object') {
				return null;
			}

			const record = item as Record<string, unknown>;
			const role = readString(record.role);
			const content = readString(record.content);
			if ((role !== 'user' && role !== 'assistant') || content.length === 0) {
				return null;
			}

			return {
				role,
				content
			};
		})
		.filter((item): item is ChatHistoryMessage => item !== null);
}

export const GET: RequestHandler = async ({ platform }) => {
	const requestId = createRequestId();
	const { baseUrl, slug } = readChatConfig(platform);

	if (!baseUrl || !isValidSlug(slug)) {
		logRagrError('Invalid chat config for model info lookup.', {
			requestId,
			baseUrlConfigured: Boolean(baseUrl),
			slug
		});
		return json({ available: false }, { status: 200 });
	}

	const infoUrl = new URL(`/models/${encodeURIComponent(slug)}/info`, baseUrl).toString();

	try {
		const infoResponse = await fetch(infoUrl, { method: 'GET' });
		if (!infoResponse.ok) {
			const responseBody = await infoResponse.text();
			logRagrError('Model info endpoint returned non-OK status.', {
				requestId,
				infoUrl,
				status: infoResponse.status,
				responsePreview: responseBody.slice(0, 400)
			});
			return json({ available: false }, { status: 200 });
		}

		const infoPayload = (await infoResponse.json()) as Record<string, unknown>;
		if (infoPayload.accepting_requests !== true) {
			return json({ available: false }, { status: 200 });
		}

		const model = readModelInfo(infoPayload, slug);
		return json({ available: true, model }, { status: 200 });
	} catch (error) {
		logRagrError('Model info fetch failed.', { requestId, infoUrl }, error);
		return json({ available: false }, { status: 200 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const requestId = createRequestId();
	let payload: unknown;

	try {
		payload = await request.json();
	} catch (error) {
		logRagrError(
			'Failed to parse chat JSON payload.',
			{
				requestId,
				contentType: request.headers.get('content-type') ?? 'unknown'
			},
			error
		);
		return json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
	}

	if (!payload || typeof payload !== 'object') {
		logRagrError('Invalid chat payload shape.', { requestId, payloadType: typeof payload });
		return json({ success: false, error: 'Invalid request payload.' }, { status: 400 });
	}

	const record = payload as Record<string, unknown>;
	const question = readString(record.question);
	const history = readHistory(record.history);

	if (!isValidQuestion(question)) {
		logRagrError('Invalid question length.', {
			requestId,
			questionLength: question.length,
			min: MIN_QUESTION_LENGTH,
			max: MAX_QUESTION_LENGTH
		});
		return json(
			{
				success: false,
				error: `Question must be between ${MIN_QUESTION_LENGTH} and ${MAX_QUESTION_LENGTH} characters.`
			},
			{ status: 400 }
		);
	}

	const { baseUrl, slug } = readChatConfig(platform);

	if (!baseUrl) {
		logRagrError('Missing RAGR_BASE_URL configuration.', { requestId, slug });
		return json({ success: false, error: 'Chat service is not configured.' }, { status: 500 });
	}

	if (!isValidSlug(slug)) {
		logRagrError('Invalid model slug configuration.', { requestId, slug });
		return json(
			{ success: false, error: 'Chat service has invalid model settings.' },
			{ status: 500 }
		);
	}

	const upstreamUrl = new URL(`/models/${encodeURIComponent(slug)}/chat`, baseUrl).toString();
	let upstreamResponse: Response;

	try {
		upstreamResponse = await fetch(upstreamUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				question,
				stream: true,
				history
			})
		});
	} catch (error) {
		logRagrError(
			'Chat upstream request failed.',
			{
				requestId,
				upstreamUrl,
				slug,
				questionLength: question.length,
				historyCount: history.length
			},
			error
		);
		return json(
			{ success: false, error: 'Unable to connect to the chat service. Please try again.' },
			{ status: 502 }
		);
	}

	if (!upstreamResponse.ok) {
		const mapped = mapUpstreamError(upstreamResponse.status);
		const responseBody = await upstreamResponse.text();
		logRagrError('Chat upstream returned non-OK status.', {
			requestId,
			upstreamUrl,
			slug,
			status: upstreamResponse.status,
			questionLength: question.length,
			historyCount: history.length,
			responsePreview: responseBody.slice(0, 400)
		});
		return json({ success: false, error: mapped.error }, { status: mapped.status });
	}

	if (!upstreamResponse.body) {
		logRagrError('Chat upstream returned empty response body.', {
			requestId,
			upstreamUrl,
			slug
		});
		return json(
			{ success: false, error: 'Chat service did not return a stream.' },
			{ status: 502 }
		);
	}

	return new Response(upstreamResponse.body, {
		status: 200,
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
