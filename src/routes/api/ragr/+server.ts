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

type ErrorSource = 'proxy' | 'upstream';

function logRagrError(message: string, context: Record<string, unknown>, error?: unknown): void {
	if (error) {
		console.error(`[ragr] ${message}`, context, error);
		return;
	}

	console.error(`[ragr] ${message}`, context);
}

function isDebugEnabled(platform?: App.Platform): boolean {
	const platformEnv = platform?.env as Record<string, unknown> | undefined;
	const raw = readString(platformEnv?.RAGR_DEBUG ?? env.RAGR_DEBUG).toLowerCase();
	return raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on';
}

function logRagrInfo(
	platform: App.Platform | undefined,
	message: string,
	context: Record<string, unknown>
): void {
	if (!isDebugEnabled(platform)) {
		return;
	}
	console.log(`[ragr] ${message}`, context);
}

async function logSseEventsFromStream(
	platform: App.Platform | undefined,
	requestId: string,
	stream: ReadableStream<Uint8Array>
): Promise<void> {
	if (!isDebugEnabled(platform)) {
		return;
	}

	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let eventCount = 0;

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				if (buffer.trim().length > 0) {
					eventCount += 1;
				}
				logRagrInfo(platform, 'Upstream SSE stream completed.', {
					requestId,
					eventCount
				});
				break;
			}

			buffer += decoder.decode(value, { stream: true });
			const blocks = buffer.split('\n\n');
			buffer = blocks.pop() ?? '';

			for (const block of blocks) {
				const trimmed = block.trim();
				if (!trimmed) {
					continue;
				}

				eventCount += 1;
				let eventType = 'message';
				const dataLines: string[] = [];

				for (const line of trimmed.split('\n')) {
					if (line.startsWith('event:')) {
						eventType = line.slice(6).trim() || 'message';
						continue;
					}
					if (line.startsWith('data:')) {
						dataLines.push(line.slice(5).trim());
					}
				}

				const dataPreview = dataLines.join('\n').slice(0, 200);
				logRagrInfo(platform, 'Received upstream SSE event.', {
					requestId,
					eventType,
					eventCount,
					dataPreview
				});
			}
		}
	} catch (error) {
		logRagrError('Failed while logging upstream SSE events.', { requestId, eventCount }, error);
	} finally {
		reader.releaseLock();
	}
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

function buildTraceHeaders(requestId: string, source?: ErrorSource): Headers {
	const headers = new Headers({ 'x-request-id': requestId });
	if (source) {
		headers.set('x-error-source', source);
	}
	return headers;
}

function errorJsonResponse(
	requestId: string,
	source: ErrorSource,
	status: number,
	error: string
): Response {
	return json(
		{
			success: false,
			error,
			requestId,
			source
		},
		{ status, headers: buildTraceHeaders(requestId, source) }
	);
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
	logRagrInfo(platform, 'GET /api/ragr received.', { requestId, slug, baseUrlConfigured: Boolean(baseUrl) });

	if (!baseUrl || !isValidSlug(slug)) {
		logRagrError('Invalid chat config for model info lookup.', {
			requestId,
			baseUrlConfigured: Boolean(baseUrl),
			slug
		});
		return json({ available: false }, { status: 200, headers: buildTraceHeaders(requestId, 'proxy') });
	}

	try {
		const infoUrl = new URL(`/models/${encodeURIComponent(slug)}/info`, baseUrl).toString();
		const infoResponse = await fetch(infoUrl, {
			method: 'GET',
			headers: {
				'x-request-id': requestId
			}
		});
		logRagrInfo(platform, 'Forwarded model info request to upstream.', {
			requestId,
			infoUrl,
			status: infoResponse.status
		});
		if (!infoResponse.ok) {
			const responseBody = await infoResponse.text();
			logRagrError('Model info endpoint returned non-OK status.', {
				requestId,
				infoUrl,
				status: infoResponse.status,
				responsePreview: responseBody.slice(0, 400)
			});
			return json({ available: false }, { status: 200, headers: buildTraceHeaders(requestId, 'upstream') });
		}

		const infoPayload = (await infoResponse.json()) as Record<string, unknown>;
		if (infoPayload.accepting_requests !== true) {
			logRagrInfo(platform, 'Model is not accepting requests.', { requestId, slug });
			return json({ available: false }, { status: 200, headers: buildTraceHeaders(requestId, 'upstream') });
		}

		const model = readModelInfo(infoPayload, slug);
		return json({ available: true, model }, { status: 200, headers: buildTraceHeaders(requestId, 'upstream') });
	} catch (error) {
		logRagrError('Model info fetch failed.', { requestId, baseUrl, slug }, error);
		return json({ available: false }, { status: 200, headers: buildTraceHeaders(requestId, 'proxy') });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const requestId = createRequestId();
	logRagrInfo(platform, 'POST /api/ragr received.', {
		requestId,
		contentType: request.headers.get('content-type') ?? 'unknown'
	});
	try {
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
			return errorJsonResponse(requestId, 'proxy', 400, 'Invalid JSON payload.');
		}

		if (!payload || typeof payload !== 'object') {
			logRagrError('Invalid chat payload shape.', { requestId, payloadType: typeof payload });
			return errorJsonResponse(requestId, 'proxy', 400, 'Invalid request payload.');
		}

		const record = payload as Record<string, unknown>;
		const question = readString(record.question);
		const history = readHistory(record.history);
		logRagrInfo(platform, 'Validated incoming chat payload.', {
			requestId,
			questionLength: question.length,
			historyCount: history.length
		});

		if (!isValidQuestion(question)) {
			logRagrError('Invalid question length.', {
				requestId,
				questionLength: question.length,
				min: MIN_QUESTION_LENGTH,
				max: MAX_QUESTION_LENGTH
			});
			return errorJsonResponse(
				requestId,
				'proxy',
				400,
				`Question must be between ${MIN_QUESTION_LENGTH} and ${MAX_QUESTION_LENGTH} characters.`
			);
		}

		const { baseUrl, slug } = readChatConfig(platform);

		if (!baseUrl) {
			logRagrError('Missing RAGR_BASE_URL configuration.', { requestId, slug });
			return errorJsonResponse(requestId, 'proxy', 500, 'Chat service is not configured.');
		}

		if (!isValidSlug(slug)) {
			logRagrError('Invalid model slug configuration.', { requestId, slug });
			return errorJsonResponse(requestId, 'proxy', 500, 'Chat service has invalid model settings.');
		}

		const upstreamUrl = new URL(`/models/${encodeURIComponent(slug)}/chat`, baseUrl).toString();
		let upstreamResponse: Response;

		try {
			upstreamResponse = await fetch(upstreamUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-request-id': requestId
				},
				body: JSON.stringify({
					question,
					stream: true,
					history
				})
			});
			logRagrInfo(platform, 'Forwarded chat request to upstream.', {
				requestId,
				upstreamUrl,
				status: upstreamResponse.status
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
			return errorJsonResponse(
				requestId,
				'upstream',
				502,
				'Unable to connect to the chat service. Please try again.'
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
			return errorJsonResponse(requestId, 'upstream', mapped.status, mapped.error);
		}

		if (!upstreamResponse.body) {
			logRagrError('Chat upstream returned empty response body.', {
				requestId,
				upstreamUrl,
				slug
			});
			return errorJsonResponse(requestId, 'upstream', 502, 'Chat service did not return a stream.');
		}
		logRagrInfo(platform, 'Streaming upstream response to client.', {
			requestId,
			source: 'upstream'
		});

		const responseHeaders = new Headers({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		});
		responseHeaders.set('x-request-id', requestId);
		responseHeaders.set('x-error-source', 'upstream');

		const [clientStream, logStream] = upstreamResponse.body.tee();
		void logSseEventsFromStream(platform, requestId, logStream);

		return new Response(clientStream, {
			status: 200,
			headers: responseHeaders
		});
	} catch (error) {
		logRagrError('Unhandled proxy error while processing chat request.', { requestId }, error);
		return errorJsonResponse(
			requestId,
			'proxy',
			500,
			'Unexpected error in chat proxy. Please try again.'
		);
	}
};
