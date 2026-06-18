import { HTTPException } from "hono/http-exception";

import {
	getRoundRobinValue,
	parseCommaSeparatedEnv,
	peekRoundRobinValue,
} from "@/lib/round-robin-env.js";

import {
	getProviderEnvVar,
	getProviderEnvConfig,
	type Provider,
} from "@llmgateway/models";

export interface ProviderEnvResult {
	token: string;
	configIndex: number;
	envVarName: string;
}

interface GetProviderEnvOptions {
	advanceRoundRobin?: boolean;
	excludedIndices?: ReadonlySet<number>;
	selectionScope?: string;
}

/**
 * Get provider token from environment variables with round-robin support
 * Supports comma-separated values in environment variables for load balancing
 * @param usedProvider The provider to get the token for
 * @returns Object containing the token and the config index used
 */
export function getProviderEnv(
	usedProvider: Provider,
	options: GetProviderEnvOptions = {},
): ProviderEnvResult {
	const envVar = getProviderEnvVar(usedProvider);
	if (!envVar) {
		throw new HTTPException(500, {
			message: `No environment variable set for provider: ${usedProvider}`,
		});
	}
	const envValue = process.env[envVar];
	if (!envValue) {
		throw new HTTPException(500, {
			message: `No API key set in environment for provider: ${usedProvider}`,
		});
	}

	// Validate required env vars for the provider
	const config = getProviderEnvConfig(usedProvider);
	if (config?.required) {
		for (const [key, envVarName] of Object.entries(config.required)) {
			if (key === "apiKey" || !envVarName) {
				continue;
			} // Already validated above
			if (!process.env[envVarName]) {
				throw new HTTPException(500, {
					message: `${envVarName} environment variable is required for ${usedProvider} provider`,
				});
			}
		}
	}

	const advanceRoundRobin = options.advanceRoundRobin ?? true;
	const excludedIndices = options.excludedIndices;
	const selectionScope = options.selectionScope;
	const result = advanceRoundRobin
		? getRoundRobinValue(envVar, envValue, selectionScope, excludedIndices)
		: peekRoundRobinValue(envVar, envValue, selectionScope, excludedIndices);

	return { token: result.value, configIndex: result.index, envVarName: envVar };
}

/**
 * Returns the number of comma-separated values configured in the named env
 * var, or 0 if it's unset/empty. Pass the resolved `envVarName` from the
 * provider context — it may be a regional override (e.g. `*__SINGAPORE`)
 * rather than the provider's base var.
 */
export function getEnvKeyCount(envVarName: string | undefined): number {
	if (!envVarName) {
		return 0;
	}
	const value = process.env[envVarName];
	if (!value) {
		return 0;
	}
	return parseCommaSeparatedEnv(value).length;
}
