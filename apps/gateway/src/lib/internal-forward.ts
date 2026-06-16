import { randomUUID } from "node:crypto";

import type { Context } from "hono";

/**
 * Header used to mark a request as a trusted internal gateway forward.
 *
 * Several endpoints (`/v1/images/*`, `/v1/responses`, `/v1/messages`) implement
 * themselves by calling `app.request("/v1/chat/completions", ...)`, which
 * re-enters the global middleware stack. Such internal forwards must not be
 * rate limited a second time — the originating request already consumed its own
 * endpoint budget, and re-counting would also throttle unrelated traffic that
 * shares the `chat_completions` bucket.
 */
export const INTERNAL_FORWARD_HEADER = "x-llmgateway-internal-forward";

/**
 * Per-process secret value for {@link INTERNAL_FORWARD_HEADER}. Generated once
 * at startup and never returned to clients, so external callers cannot spoof it
 * to bypass middleware such as the org rate limiter.
 */
export const INTERNAL_FORWARD_TOKEN = randomUUID();

/** Headers to attach to an internal `app.request()` forward. */
export function internalForwardHeaders(): Record<string, string> {
	return { [INTERNAL_FORWARD_HEADER]: INTERNAL_FORWARD_TOKEN };
}

/** Whether a request is a trusted internal forward (vs. an external caller). */
export function isInternalForward(c: Pick<Context, "req">): boolean {
	return c.req.header(INTERNAL_FORWARD_HEADER) === INTERNAL_FORWARD_TOKEN;
}
