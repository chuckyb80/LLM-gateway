import { logger } from "@llmgateway/logger";

import {
	createLogEntry,
	type CreateLogEntryOptions,
} from "./create-log-entry.js";

import type { ServerTypes } from "@/vars.js";
import type { LogInsertData } from "@llmgateway/db";
import type { Context } from "hono";

export interface ChatCompletionLogState {
	pendingLogs: LogInsertData[];
	baseLogOptions?: Partial<CreateLogEntryOptions>;
	rawRequestPreview?: Request;
	rawRequestPreviewPromise?: Promise<unknown>;
	streamCompletion?: Promise<void>;
	resolveStreamCompletion?: () => void;
	caughtError?: unknown;
	internalContentFilter?: boolean;
	gatewayContentFilterResponse?: unknown;
	clientErrorSynthesized?: boolean;
	syncInsert?: boolean;
	logIdOverride?: string;
	responsesApiData?: unknown;
}

function getOrCreateChatCompletionLogState(
	c: Context<ServerTypes>,
): ChatCompletionLogState {
	const existingState = c.get("chatCompletionLogState");
	if (existingState) {
		return existingState;
	}

	const nextState: ChatCompletionLogState = {
		pendingLogs: [],
		clientErrorSynthesized: false,
	};
	c.set("chatCompletionLogState", nextState);
	return nextState;
}

export function getChatCompletionLogState(
	c: Context<ServerTypes>,
): ChatCompletionLogState | undefined {
	return c.get("chatCompletionLogState");
}

export function updateBaseLogOptions(
	c: Context<ServerTypes>,
	patch: Partial<CreateLogEntryOptions>,
) {
	const state = getOrCreateChatCompletionLogState(c);
	state.baseLogOptions = {
		...state.baseLogOptions,
		...patch,
	};
}

export function updateLogInsertOptions(
	c: Context<ServerTypes>,
	patch: Pick<
		ChatCompletionLogState,
		"syncInsert" | "logIdOverride" | "responsesApiData"
	>,
) {
	const state = getOrCreateChatCompletionLogState(c);
	state.syncInsert = patch.syncInsert;
	state.logIdOverride = patch.logIdOverride;
	state.responsesApiData = patch.responsesApiData;
}

function hasCompleteBaseLogOptions(
	options?: Partial<CreateLogEntryOptions>,
): options is CreateLogEntryOptions {
	return Boolean(
		options &&
			typeof options.requestId === "string" &&
			options.project &&
			options.apiKey &&
			typeof options.usedModel === "string" &&
			typeof options.usedProvider === "string" &&
			typeof options.requestedModel === "string" &&
			Array.isArray(options.messages) &&
			options.customHeaders !== undefined &&
			typeof options.debugMode === "boolean",
	);
}

export function buildBaseLogEntry(
	c: Context<ServerTypes>,
	patch: Partial<CreateLogEntryOptions> = {},
) {
	const state = getOrCreateChatCompletionLogState(c);
	const mergedOptions = {
		...state.baseLogOptions,
		...patch,
	};

	if (!hasCompleteBaseLogOptions(mergedOptions)) {
		return null;
	}

	return createLogEntry(mergedOptions);
}

export function enqueueChatLog(
	c: Context<ServerTypes>,
	basePatch: Partial<CreateLogEntryOptions>,
	logFields: Omit<LogInsertData, keyof ReturnType<typeof createLogEntry>>,
) {
	const state = getOrCreateChatCompletionLogState(c);
	const baseLogEntry = buildBaseLogEntry(c, basePatch);

	if (!baseLogEntry) {
		logger.warn(
			"Skipping chat log enqueue because base log options are incomplete",
			{
				requestId: state.baseLogOptions?.requestId,
			},
		);
		return;
	}

	state.pendingLogs.push({
		...baseLogEntry,
		...logFields,
	});
}

export function registerStreamCompletion(c: Context<ServerTypes>) {
	const state = getOrCreateChatCompletionLogState(c);
	state.streamCompletion ??= new Promise<void>((resolve) => {
		state.resolveStreamCompletion = resolve;
	});

	return state.streamCompletion;
}

export function finishStreamCompletion(c: Context<ServerTypes>) {
	const state = getOrCreateChatCompletionLogState(c);
	state.resolveStreamCompletion?.();
	state.resolveStreamCompletion = undefined;
}
