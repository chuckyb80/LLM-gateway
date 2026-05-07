import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

import {
	buildBaseLogEntry,
	type ChatCompletionLogState,
	updateBaseLogOptions,
} from "@/chat/tools/chat-log-context.js";
import { extractCustomHeaders } from "@/chat/tools/extract-custom-headers.js";
import { parseModelInput } from "@/chat/tools/parse-model-input.js";
import { validateSource } from "@/chat/tools/validate-source.js";
import { assertApiKeyWithinUsageLimits } from "@/lib/api-key-usage-limits.js";
import { findApiKeyByToken, findProjectById } from "@/lib/cached-queries.js";
import { parseApiToken } from "@/lib/extract-api-token.js";
import { insertLog } from "@/lib/logs.js";

import { shortid } from "@llmgateway/db";
import { logger } from "@llmgateway/logger";

import type { ServerTypes } from "@/vars.js";
import type { LogInsertData } from "@llmgateway/db";
import type { Context } from "hono";

function getRequestId(c: Context<ServerTypes>): string {
	return c.req.header("x-request-id") ?? shortid(40);
}

function getDebugMode(c: Context<ServerTypes>): boolean {
	return (
		c.req.header("x-debug") === "true" ||
		process.env.FORCE_DEBUG_MODE === "true" ||
		process.env.NODE_ENV !== "production"
	);
}

function getSource(c: Context<ServerTypes>): string | undefined {
	let source = validateSource(
		c.req.header("x-source"),
		c.req.header("HTTP-Referer"),
	);
	const userAgent = c.req.header("User-Agent");

	if (!source && userAgent && /^claude-cli\/.+/.test(userAgent)) {
		source = "claude.com/claude-code";
	}

	return source;
}

function getRawRequestDetails(rawRequest: unknown): {
	messages: unknown[];
	requestedModel: string;
	requestedProvider?: string;
	usedModelMapping?: string;
	usedProvider: string;
} {
	const messages =
		typeof rawRequest === "object" &&
		rawRequest !== null &&
		"messages" in rawRequest &&
		Array.isArray(rawRequest.messages)
			? rawRequest.messages
			: [];

	const requestedModel =
		typeof rawRequest === "object" &&
		rawRequest !== null &&
		"model" in rawRequest &&
		typeof rawRequest.model === "string"
			? rawRequest.model
			: "unknown";

	if (requestedModel === "unknown") {
		return {
			messages,
			requestedModel,
			usedProvider: "llmgateway",
		};
	}

	try {
		const parsedModel = parseModelInput(requestedModel);
		return {
			messages,
			requestedModel,
			requestedProvider: parsedModel.requestedProvider,
			usedModelMapping: parsedModel.requestedModel,
			usedProvider: parsedModel.requestedProvider ?? "llmgateway",
		};
	} catch {
		return {
			messages,
			requestedModel,
			usedProvider: "llmgateway",
		};
	}
}

async function getRawRequestPreview(
	state: ChatCompletionLogState,
): Promise<unknown> {
	state.rawRequestPreviewPromise ??= state.rawRequestPreview
		?.json()
		.catch(() => undefined);

	return await state.rawRequestPreviewPromise;
}

async function buildFallbackBaseLogEntry(
	c: Context<ServerTypes>,
	state: ChatCompletionLogState,
): Promise<ReturnType<typeof buildBaseLogEntry> | null> {
	const existingBaseLogEntry = buildBaseLogEntry(c);
	if (existingBaseLogEntry) {
		return existingBaseLogEntry;
	}

	const token = parseApiToken(c);
	if (!token) {
		return null;
	}

	const apiKey = await findApiKeyByToken(token);
	if (!apiKey || apiKey.status !== "active") {
		return null;
	}

	try {
		assertApiKeyWithinUsageLimits(apiKey);
	} catch {
		return null;
	}

	const project = await findProjectById(apiKey.projectId);
	if (!project || project.status === "deleted") {
		return null;
	}

	const rawRequest = await getRawRequestPreview(state);
	const rawRequestDetails = getRawRequestDetails(rawRequest);

	updateBaseLogOptions(c, {
		requestId: getRequestId(c),
		project,
		apiKey,
		usedModel: rawRequestDetails.requestedModel,
		usedModelMapping: rawRequestDetails.usedModelMapping,
		usedProvider: rawRequestDetails.usedProvider,
		requestedModel: rawRequestDetails.requestedModel,
		requestedProvider: rawRequestDetails.requestedProvider,
		messages: rawRequestDetails.messages,
		customHeaders: extractCustomHeaders(c),
		debugMode: getDebugMode(c),
		userAgent: c.req.header("User-Agent") ?? undefined,
		source: getSource(c),
		rawRequest,
	});

	return buildBaseLogEntry(c);
}

async function getSynthesizedClientErrorDetails(
	c: Context<ServerTypes>,
	error: unknown,
): Promise<{
	responseText: string;
	statusText: string;
}> {
	if (error instanceof HTTPException) {
		return {
			responseText: error.message,
			statusText: error.res?.statusText ?? "Client Error",
		};
	}

	try {
		const responseText = await c.res.clone().text();
		return {
			responseText: responseText || "Client error",
			statusText: c.res.statusText ?? "Client Error",
		};
	} catch {
		return {
			responseText: error instanceof Error ? error.message : "Client error",
			statusText:
				error instanceof Error
					? error.name
					: (c.res.statusText ?? "Client Error"),
		};
	}
}

async function getSynthesizedClientErrorLog(
	c: Context<ServerTypes>,
	state: ChatCompletionLogState,
	status: number,
	error: unknown,
): Promise<LogInsertData | null> {
	const baseLogEntry = await buildFallbackBaseLogEntry(c, state);
	if (!baseLogEntry) {
		return null;
	}

	const { responseText, statusText } = await getSynthesizedClientErrorDetails(
		c,
		error,
	);

	return {
		...baseLogEntry,
		content: null,
		responseSize: responseText.length,
		finishReason: "client_error",
		unifiedFinishReason: "client_error",
		promptTokens: null,
		completionTokens: null,
		totalTokens: null,
		reasoningTokens: null,
		cachedTokens: null,
		hasError: true,
		streamed:
			typeof baseLogEntry.rawRequest === "object" &&
			baseLogEntry.rawRequest !== null &&
			"stream" in baseLogEntry.rawRequest
				? Boolean(baseLogEntry.rawRequest.stream)
				: false,
		canceled: false,
		errorDetails: {
			statusCode: status,
			statusText,
			responseText,
		},
		duration: 0,
		timeToFirstToken: null,
		timeToFirstReasoningToken: null,
		inputCost: null,
		outputCost: null,
		cachedInputCost: null,
		requestCost: null,
		webSearchCost: null,
		imageInputTokens: null,
		imageOutputTokens: null,
		imageInputCost: null,
		imageOutputCost: null,
		cost: null,
		estimatedCost: false,
		discount: null,
		pricingTier: null,
		dataStorageCost: "0",
		cached: false,
		toolResults: null,
	};
}

export function shouldSynthesizeClientError(
	status: number,
	pendingLogs: LogInsertData[],
): boolean {
	return status >= 400 && status < 500 && pendingLogs.length === 0;
}

async function flushChatCompletionLogs(
	c: Context<ServerTypes>,
	state: ChatCompletionLogState,
) {
	try {
		await state.streamCompletion;
	} catch (error) {
		logger.error(
			"Error waiting for chat stream completion before flushing logs",
			error instanceof Error ? error : new Error(String(error)),
		);
	}

	const status =
		state.caughtError instanceof HTTPException
			? state.caughtError.status
			: c.res.status;

	if (shouldSynthesizeClientError(status, state.pendingLogs)) {
		const synthesizedLog = await getSynthesizedClientErrorLog(
			c,
			state,
			status,
			state.caughtError,
		);
		if (synthesizedLog) {
			state.pendingLogs.push(synthesizedLog);
			state.clientErrorSynthesized = true;
		}
	}

	for (const logData of state.pendingLogs) {
		try {
			await insertLog(
				{
					...logData,
					...(state.logIdOverride && !logData.retried
						? { id: state.logIdOverride }
						: {}),
					responsesApiData:
						logData.responsesApiData ?? state.responsesApiData ?? null,
					internalContentFilter: state.internalContentFilter
						? true
						: logData.internalContentFilter,
					gatewayContentFilterResponse:
						logData.gatewayContentFilterResponse ??
						(state.gatewayContentFilterResponse as
							| LogInsertData["gatewayContentFilterResponse"]
							| undefined) ??
						null,
				},
				{ syncInsert: state.syncInsert },
			);
		} catch (error) {
			logger.error(
				"Failed to flush queued chat completion log",
				error instanceof Error ? error : new Error(String(error)),
			);
		}
	}
}

export const chatCompletionLogMiddleware = createMiddleware<ServerTypes>(
	async (c, next) => {
		const state: ChatCompletionLogState = {
			pendingLogs: [],
			clientErrorSynthesized: false,
			rawRequestPreview: c.req.raw.clone(),
		};
		c.set("chatCompletionLogState", state);

		try {
			await next();
		} catch (error) {
			state.caughtError = error;
			throw error;
		} finally {
			if (state.streamCompletion) {
				void flushChatCompletionLogs(c, state).catch((error) => {
					logger.error(
						"Unexpected failure flushing queued chat completion logs",
						error instanceof Error ? error : new Error(String(error)),
					);
				});
			} else {
				await flushChatCompletionLogs(c, state);
			}
		}
	},
);
