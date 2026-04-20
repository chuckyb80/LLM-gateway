import { AlertCircle, CheckCircle2, Terminal } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Alert> = {
	title: "UI/Alert",
	component: Alert,
	argTypes: {
		variant: { control: "select", options: ["default", "destructive"] },
	},
};

export default meta;

type Story = StoryObj<typeof Alert>;

export const Default: Story = {
	render: (args) => (
		<Alert {...args} className="w-96">
			<Terminal className="size-4" />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>
				You can add components to your app using the CLI.
			</AlertDescription>
		</Alert>
	),
};

export const Destructive: Story = {
	args: { variant: "destructive" },
	render: (args) => (
		<Alert {...args} className="w-96">
			<AlertCircle className="size-4" />
			<AlertTitle>Error</AlertTitle>
			<AlertDescription>
				Your session has expired. Please log in again.
			</AlertDescription>
		</Alert>
	),
};

export const Success: Story = {
	render: () => (
		<Alert className="w-96 border-emerald-500/50 text-emerald-700 dark:text-emerald-400">
			<CheckCircle2 className="size-4" />
			<AlertTitle>Saved</AlertTitle>
			<AlertDescription>Your changes have been saved.</AlertDescription>
		</Alert>
	),
};
