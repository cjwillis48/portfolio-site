<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount, tick } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import DOMPurify from 'isomorphic-dompurify';
	import { marked } from 'marked';

	interface ChatMessage {
		id: string;
		role: 'user' | 'assistant';
		content: string;
		status?: string;
		isStreaming?: boolean;
	}

	interface DoneEventPayload {
		answer: string;
		status: string;
	}

	interface ErrorEventPayload {
		error: string;
	}

interface ChatErrorResponsePayload {
	error?: string;
}

	interface ModelInfoPayload {
		name?: string;
		slug?: string;
		description?: string;
		greeting?: string;
		placeholder?: string;
	}

	interface HistoryMessage {
		role: 'user' | 'assistant';
		content: string;
	}

	let isOpen = $state(false);
	let isChatAvailable = $state(false);
	let panelWidth = $state(384);
	let panelHeight = $state(512);
	let modelName = $state('Chat Assistant');
	let modelDescription = $state('Ask questions about Charlie.');
	let inputPlaceholder = $state('Ask a question...');
	let emptyStateHint = $state('Ask about experience, projects, or skills.');
	let input = $state('');
	let isSending = $state(false);
	let errorMessage = $state('');
	let showLauncherHint = $state(false);
	let messages = $state<ChatMessage[]>([]);
	let conversationHistory = $state<HistoryMessage[]>([]);
	let messagesContainer = $state<HTMLDivElement | undefined>(undefined);
	let isResizing = false;
	let resizeStartX = 0;
	let resizeStartY = 0;
	let resizeStartWidth = 0;
	let resizeStartHeight = 0;

	const MIN_PANEL_WIDTH = 320;
	const MIN_PANEL_HEIGHT = 384;
	const VIEWPORT_MARGIN_PX = 32;
	const MAX_HEIGHT_RATIO = 0.7;
	const LAUNCHER_HINT_MS = 6500;
	let launcherHintTimeout: ReturnType<typeof setTimeout> | undefined;

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	function getMaxPanelSize(): { width: number; height: number } {
		const maxWidth = Math.max(MIN_PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN_PX);
		const maxHeight = Math.max(MIN_PANEL_HEIGHT, Math.floor(window.innerHeight * MAX_HEIGHT_RATIO));
		return { width: maxWidth, height: maxHeight };
	}

	function syncPanelSizeToViewport() {
		const { width: maxWidth, height: maxHeight } = getMaxPanelSize();
		panelWidth = clamp(panelWidth, MIN_PANEL_WIDTH, maxWidth);
		panelHeight = clamp(panelHeight, MIN_PANEL_HEIGHT, maxHeight);
	}

	function handleResizeMove(event: PointerEvent) {
		if (!isResizing) {
			return;
		}

		const deltaX = resizeStartX - event.clientX;
		const deltaY = resizeStartY - event.clientY;
		const { width: maxWidth, height: maxHeight } = getMaxPanelSize();
		panelWidth = clamp(resizeStartWidth + deltaX, MIN_PANEL_WIDTH, maxWidth);
		panelHeight = clamp(resizeStartHeight + deltaY, MIN_PANEL_HEIGHT, maxHeight);
	}

	function stopResize() {
		isResizing = false;
	}

	function handleResizeStart(event: PointerEvent) {
		if (window.innerWidth < 768) {
			return;
		}

		isResizing = true;
		resizeStartX = event.clientX;
		resizeStartY = event.clientY;
		resizeStartWidth = panelWidth;
		resizeStartHeight = panelHeight;
		event.preventDefault();
	}

	onMount(async () => {
		syncPanelSizeToViewport();
		window.addEventListener('pointermove', handleResizeMove);
		window.addEventListener('pointerup', stopResize);
		window.addEventListener('pointercancel', stopResize);
		window.addEventListener('resize', syncPanelSizeToViewport);

		try {
			const response = await fetch('/api/ragr', { method: 'GET' });
			if (!response.ok) {
				isChatAvailable = false;
				return;
			}

			const payload = (await response.json()) as {
				available?: boolean;
				model?: ModelInfoPayload;
			};
			isChatAvailable = payload.available === true;
			if (!isChatAvailable) {
				isOpen = false;
				showLauncherHint = false;
				return;
			}

			const model = payload.model ?? {};
			modelName = model.name?.trim() || 'Chat Assistant';
			modelDescription = model.description?.trim() || 'Ask questions about Charlie.';
			inputPlaceholder = model.placeholder?.trim() || 'Ask a question...';
			emptyStateHint = model.placeholder?.trim() || 'Ask about experience, projects, or skills.';
			messages = [
				{
					id: crypto.randomUUID(),
					role: 'assistant',
					content: model.greeting?.trim() || 'Hi! Ask me anything about Charlie.',
					status: 'answered'
				}
			];
			conversationHistory = [];
			isOpen = false;
			showLauncherHint = true;
			if (launcherHintTimeout) {
				clearTimeout(launcherHintTimeout);
			}
			launcherHintTimeout = setTimeout(() => {
				showLauncherHint = false;
			}, LAUNCHER_HINT_MS);
		} catch {
			isChatAvailable = false;
			isOpen = false;
			showLauncherHint = false;
		}
	});

	onDestroy(() => {
		if (launcherHintTimeout) {
			clearTimeout(launcherHintTimeout);
		}

		if (!browser) {
			return;
		}

		window.removeEventListener('pointermove', handleResizeMove);
		window.removeEventListener('pointerup', stopResize);
		window.removeEventListener('pointercancel', stopResize);
		window.removeEventListener('resize', syncPanelSizeToViewport);
	});

	function parseDonePayload(value: unknown): DoneEventPayload | null {
		if (!value || typeof value !== 'object') {
			return null;
		}

		const record = value as Record<string, unknown>;
		if (typeof record.answer !== 'string') {
			return null;
		}

		if (typeof record.status === 'string' && record.status.trim().length > 0) {
			return {
				answer: record.answer,
				status: record.status.trim()
			};
		}

		// Backward compatibility for older boolean contract.
		if (typeof record.answered === 'boolean') {
			return {
				answer: record.answer,
				status: record.answered ? 'answered' : 'unanswered'
			};
		}

		return null;
	}

	function isErrorPayload(value: unknown): value is ErrorEventPayload {
		if (!value || typeof value !== 'object') {
			return false;
		}

		const record = value as Record<string, unknown>;
		return typeof record.error === 'string';
	}

	async function scrollToBottom() {
		await tick();
		if (!messagesContainer) {
			return;
		}

		messagesContainer.scrollTop = messagesContainer.scrollHeight;
	}

	function updateAssistantMessage(
		messageId: string,
		updater: (message: ChatMessage) => ChatMessage
	) {
		messages = messages.map((message) => (message.id === messageId ? updater(message) : message));
	}

	function appendDelta(messageId: string, dataValue: string) {
		updateAssistantMessage(messageId, (message) => ({
			...message,
			content: message.content + dataValue
		}));
	}

	function finalizeMessage(messageId: string, payload: DoneEventPayload) {
		updateAssistantMessage(messageId, (message) => ({
			...message,
			content: payload.answer,
			status: payload.status,
			isStreaming: false
		}));
	}

	function isNonAnsweredStatus(status: string | undefined): boolean {
		return typeof status === 'string' && status !== 'answered';
	}

	function getStatusLabel(status: string | undefined): string {
		if (!status) {
			return 'Status';
		}

		if (status === 'off_topic') {
			return 'Off-topic';
		}

		if (status === 'unanswered') {
			return 'Unanswered';
		}

		if (status === 'error') {
			return 'Error';
		}

		return status.replace(/_/g, ' ');
	}

	function getStatusDescription(status: string | undefined): string {
		if (status === 'off_topic') {
			return "This question may be outside this model's resume and project context.";
		}

		if (status === 'unanswered') {
			return "This model couldn't confidently answer that from its current knowledge. Try rephrasing, or ask about Charlie's projects and experience.";
		}

		if (status === 'error') {
			return 'Something went wrong while generating a response. Please try again in a moment.';
		}

		return `Response status: ${getStatusLabel(status)}.`;
	}

	function getStatusContainerClass(status: string | undefined): string {
		if (status === 'off_topic') {
			return 'bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30';
		}

		if (status === 'unanswered') {
			return 'bg-sky-50 text-sky-900 border border-sky-200 dark:bg-sky-500/10 dark:text-sky-200 dark:border-sky-500/30';
		}

		if (status === 'error') {
			return 'bg-rose-50 text-rose-900 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/30';
		}

		return 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100';
	}

	function getStatusBadgeClass(status: string | undefined): string {
		if (status === 'off_topic') {
			return 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/20 dark:text-amber-100';
		}

		if (status === 'unanswered') {
			return 'border-sky-300 bg-sky-100 text-sky-900 dark:border-sky-400/40 dark:bg-sky-400/20 dark:text-sky-100';
		}

		if (status === 'error') {
			return 'border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-400/40 dark:bg-rose-400/20 dark:text-rose-100';
		}

		return 'border-slate-300 bg-slate-100 text-slate-900 dark:border-slate-500/40 dark:bg-slate-500/20 dark:text-slate-100';
	}

	function getStatusDescriptionClass(status: string | undefined): string {
		if (status === 'off_topic') {
			return 'text-amber-800 dark:text-amber-200/90';
		}

		if (status === 'unanswered') {
			return 'text-sky-800 dark:text-sky-200/90';
		}

		if (status === 'error') {
			return 'text-rose-800 dark:text-rose-200/90';
		}

		return 'text-slate-700 dark:text-slate-300';
	}

	function getStatusSuggestions(status: string | undefined): string[] {
		if (status === 'off_topic') {
			return [
				'What backend projects has Charlie led recently?',
				'What are Charlie’s strongest technical skills?',
				'Summarize Charlie’s recent experience.'
			];
		}
		return [];
	}

	function parseEventBlock(block: string): { eventType: string; data: string } {
		const lines = block.split('\n');
		let eventType = 'message';
		const dataLines: string[] = [];

		for (const line of lines) {
			if (line.startsWith('event:')) {
				eventType = line.slice(6).trim();
				continue;
			}

			if (line.startsWith('data:')) {
				dataLines.push(line.slice(5).trim());
			}
		}

		return { eventType, data: dataLines.join('\n') };
	}

	function renderAssistantMarkdown(content: string): string {
		const html = marked.parse(content, { gfm: true, breaks: true });
		return DOMPurify.sanitize(typeof html === 'string' ? html : '');
	}

	async function sendMessage() {
		if (!isChatAvailable) {
			return;
		}

		if (isSending) {
			return;
		}

		const question = input.trim();
		if (!question) {
			return;
		}

		errorMessage = '';
		isSending = true;
		input = '';

		const userMessage: ChatMessage = {
			id: crypto.randomUUID(),
			role: 'user',
			content: question
		};
		const historyForRequest = conversationHistory.slice(-20);
		const assistantMessageId = crypto.randomUUID();
		const assistantMessage: ChatMessage = {
			id: assistantMessageId,
			role: 'assistant',
			content: '',
			status: 'answered',
			isStreaming: true
		};

		messages = [...messages, userMessage, assistantMessage];
		await scrollToBottom();

		try {
			const response = await fetch('/api/ragr', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					question,
					history: historyForRequest
				})
			});

			if (!response.ok || !response.body) {
				const fallback = 'I hit an issue reaching the chat service. Please try again.';
				let parsedError = fallback;
				try {
					const body = (await response.json()) as ChatErrorResponsePayload;
					if (typeof body.error === 'string' && body.error.trim()) {
						parsedError = body.error;
					}
				} catch {
					// Ignore JSON parse errors and use fallback.
				}
				throw new Error(parsedError);
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';
			let receivedDoneEvent = false;
			let streamError: string | null = null;
			let finalAssistantContent = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
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

					const parsed = parseEventBlock(trimmed);
					if (!parsed.data) {
						continue;
					}

					if (parsed.eventType === 'done') {
						try {
							const donePayload = JSON.parse(parsed.data) as unknown;
							const parsedDone = parseDonePayload(donePayload);
							if (parsedDone) {
								finalizeMessage(assistantMessageId, parsedDone);
								receivedDoneEvent = true;
								finalAssistantContent = parsedDone.answer;
							}
						} catch {
							// Ignore malformed done payloads and keep streaming fallback behavior.
						}
						continue;
					}

					if (parsed.eventType === 'error') {
						try {
							const errorPayload = JSON.parse(parsed.data) as unknown;
							if (isErrorPayload(errorPayload)) {
								streamError = errorPayload.error;
							} else {
								streamError = 'The chat service returned an error.';
							}
						} catch {
							streamError = 'The chat service returned an error.';
						}
						break;
					}

					try {
						const delta = JSON.parse(parsed.data) as unknown;
						if (typeof delta === 'string') {
							appendDelta(assistantMessageId, delta);
							finalAssistantContent += delta;
						}
					} catch {
						// If upstream ever sends plain text, append it as-is.
						appendDelta(assistantMessageId, parsed.data);
						finalAssistantContent += parsed.data;
					}
				}

				await scrollToBottom();

				if (streamError) {
					break;
				}
			}

			if (streamError) {
				throw new Error(streamError);
			}

			if (!receivedDoneEvent) {
				updateAssistantMessage(assistantMessageId, (message) => ({
					...message,
					isStreaming: false
				}));
			}

			const assistantHistoryContent = finalAssistantContent.trim();
			if (assistantHistoryContent) {
				const updatedHistory: HistoryMessage[] = [
					...conversationHistory,
					{ role: 'user', content: question },
					{ role: 'assistant', content: assistantHistoryContent }
				];
				conversationHistory = updatedHistory.slice(-20);
			}
		} catch (error) {
			const message =
				error instanceof Error && error.message
					? error.message
					: 'I ran into an unexpected issue. Please try again.';
			errorMessage = message;
			updateAssistantMessage(assistantMessageId, (assistant) => ({
				...assistant,
				content: assistant.content || message,
				status: 'error',
				isStreaming: false
			}));
		} finally {
			isSending = false;
			await scrollToBottom();
		}
	}

	async function useSuggestion(suggestion: string) {
		if (isSending) {
			return;
		}

		input = suggestion;
		await sendMessage();
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		await sendMessage();
	}

	async function handleInputKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			await sendMessage();
		}
	}
</script>

{#if isChatAvailable}
	<div
		in:fly={{ x: 96, duration: 320, opacity: 0 }}
		class="fixed right-4 bottom-4 z-40"
	>
		{#if isOpen}
			<section
				class="relative flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden dark:bg-slate-900 dark:border-slate-700"
				style={`width: ${panelWidth}px; height: ${panelHeight}px; max-width: calc(100vw - 2rem); max-height: 70vh;`}
				aria-label={`${modelName} chat`}
			>
				<button
					type="button"
					class="hidden md:flex absolute top-0 left-0 h-6 w-6 items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-nwse-resize z-10"
					onpointerdown={handleResizeStart}
					aria-label="Resize chat window"
				>
					<svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" aria-hidden="true">
						<path
							d="M3 13L13 3M8 13L13 8M3 8L8 3"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					</svg>
				</button>
				<header
					class="px-4 py-3 border-b border-slate-200 bg-slate-50 dark:bg-slate-800/70 dark:border-slate-700 flex items-center justify-between gap-2"
				>
					<div>
						<p class="font-semibold text-slate-900 dark:text-slate-100">{modelName}</p>
						<p class="text-xs text-slate-500 dark:text-slate-400">{modelDescription}</p>
					</div>
					<button
						class="text-sm px-2 py-1 rounded-md text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
						onclick={() => (isOpen = false)}
						aria-label="Close chat"
					>
						Close
					</button>
				</header>

				<div
					bind:this={messagesContainer}
					class="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3 bg-white dark:bg-slate-900"
				>
					{#if messages.length === 1}
						<p class="text-xs text-slate-500 dark:text-slate-400">{emptyStateHint}</p>
					{/if}

					{#each messages as message (message.id)}
						<div class={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
							{#if message.role === 'user'}
								<p
									class="max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap bg-indigo-600 text-white"
								>
									{message.content}
								</p>
							{:else}
								<div
									class={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
										isNonAnsweredStatus(message.status)
											? getStatusContainerClass(message.status)
											: 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
									}`}
								>
									{#if isNonAnsweredStatus(message.status)}
										<div class="mb-2 flex items-start gap-2">
											<span
												class={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(
													message.status
												)}`}
												aria-label={`Response status: ${getStatusLabel(message.status)}`}
												title={getStatusDescription(message.status)}
											>
												<svg viewBox="0 0 16 16" class="h-3 w-3" fill="none" aria-hidden="true">
													<circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.4" />
													<path
														d="M8 7.1v3.3M8 5.2h.01"
														stroke="currentColor"
														stroke-width="1.4"
														stroke-linecap="round"
													/>
												</svg>
												{getStatusLabel(message.status)}
											</span>
										</div>
										<p
											class={`mb-2 text-[11px] leading-snug ${getStatusDescriptionClass(
												message.status
											)}`}
										>
											{getStatusDescription(message.status)}
										</p>
										<div class="mb-2 flex flex-wrap gap-1.5">
											{#each getStatusSuggestions(message.status) as suggestion}
												<button
													type="button"
													class="rounded-full border border-slate-300/80 bg-white/80 px-2 py-1 text-[11px] leading-tight text-slate-700 hover:bg-white dark:border-slate-500/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
													onclick={() => useSuggestion(suggestion)}
													disabled={isSending}
												>
													{suggestion}
												</button>
											{/each}
										</div>
									{/if}
									{#if message.content}
										<div
											class="chat-markdown break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_a]:underline [&_a]:break-all [&_code]:text-[0.95em] [&_pre]:overflow-x-auto [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5"
										>
											<!-- eslint-disable-next-line svelte/no-at-html-tags -->
											{@html renderAssistantMarkdown(message.content)}
										</div>
									{:else if message.isStreaming}
										<span class="text-slate-500 dark:text-slate-400">Thinking...</span>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<form
					class="p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
					onsubmit={handleSubmit}
				>
					<label for="chat-input" class="sr-only">Ask a question</label>
					<div class="flex items-end gap-2">
						<textarea
							id="chat-input"
							bind:value={input}
							rows="2"
							maxlength="2000"
							placeholder={inputPlaceholder}
							class="min-h-[2.75rem] max-h-28 flex-1 resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-900/40"
							disabled={isSending}
							onkeydown={handleInputKeydown}
						></textarea>
						<button
							type="submit"
							disabled={isSending || !input.trim()}
							class="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSending ? '...' : 'Send'}
						</button>
					</div>
					{#if errorMessage}
						<p class="mt-2 text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
					{/if}
				</form>
			</section>
		{:else}
			<div class="flex flex-col items-end gap-2">
				{#if showLauncherHint}
					<div
						in:fly={{ x: 56, duration: 260, opacity: 0 }}
						out:fade={{ duration: 300 }}
						class="rounded-xl bg-white/95 border border-slate-200 px-3 py-2 text-xs text-slate-700 shadow-md dark:bg-slate-900/95 dark:border-slate-700 dark:text-slate-200"
					>
						{inputPlaceholder}
					</div>
				{/if}
				<button
					in:fly={{ x: 72, duration: 300, opacity: 0 }}
					class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 transition-all duration-200 hover:scale-[1.02] active:scale-95"
					onclick={() => {
						isOpen = true;
						showLauncherHint = false;
					}}
					aria-label="Open chatbot assistant"
					title={`Open ${modelName}`}
				>
					<svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M8 10h8M8 14h5M12 3C7.03 3 3 6.58 3 11c0 2.02.84 3.87 2.23 5.29L5 21l4.08-1.91c.92.25 1.9.38 2.92.38 4.97 0 9-3.58 9-8s-4.03-8.47-9-8.47z"
							stroke="currentColor"
							stroke-width="1.8"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
		{/if}
	</div>
{/if}
