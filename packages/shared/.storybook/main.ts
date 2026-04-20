import path from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: ["@storybook/addon-themes"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	typescript: {
		reactDocgen: "react-docgen-typescript",
	},
	viteFinal: async (config) => {
		const { default: tailwindcss } = await import("@tailwindcss/vite");
		config.plugins = config.plugins || [];
		config.plugins.push(tailwindcss());
		const existingAlias = config.resolve?.alias;
		const aliasRecord: Record<string, string> =
			existingAlias && !Array.isArray(existingAlias)
				? (existingAlias as Record<string, string>)
				: {};
		config.resolve = {
			...(config.resolve || {}),
			alias: {
				...aliasRecord,
				"@": path.resolve(__dirname, "../src"),
			},
		};
		return config;
	},
};

export default config;
