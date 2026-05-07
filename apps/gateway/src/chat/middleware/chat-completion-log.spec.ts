import { describe, expect, it } from "vitest";

import { shouldSynthesizeClientError } from "./chat-completion-log.js";

describe("shouldSynthesizeClientError", () => {
	it("synthesizes for 4xx responses when no logs are queued", () => {
		expect(shouldSynthesizeClientError(400, [])).toBe(true);
		expect(shouldSynthesizeClientError(429, [])).toBe(true);
	});

	it("skips synthesis when any terminal log is already queued", () => {
		expect(
			shouldSynthesizeClientError(400, [
				{
					finishReason: "canceled",
				} as never,
			]),
		).toBe(false);
		expect(
			shouldSynthesizeClientError(400, [
				{
					finishReason: "content_filter",
				} as never,
			]),
		).toBe(false);
	});

	it("skips synthesis for non-4xx responses", () => {
		expect(shouldSynthesizeClientError(200, [])).toBe(false);
		expect(shouldSynthesizeClientError(500, [])).toBe(false);
	});
});
