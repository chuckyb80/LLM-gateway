import type { ChatCompletionLogState } from "@/chat/tools/chat-log-context.js";
import type { Env } from "hono/types";

export interface ServerTypes extends Env {
	Variables: {
		traceId?: string;
		spanId?: string;
		chatCompletionLogState?: ChatCompletionLogState;
	};
}
