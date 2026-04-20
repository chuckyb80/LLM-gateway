import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Input> = {
	title: "UI/Input",
	component: Input,
	argTypes: {
		type: {
			control: "select",
			options: ["text", "email", "password", "number", "search", "tel", "url"],
		},
		disabled: { control: "boolean" },
	},
	args: {
		placeholder: "Enter text...",
	},
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Email: Story = {
	args: { type: "email", placeholder: "email@example.com" },
};

export const Password: Story = {
	args: { type: "password", placeholder: "••••••••" },
};

export const Disabled: Story = {
	args: { disabled: true, value: "Disabled input" },
};

export const WithLabel: Story = {
	render: (args) => (
		<div className="grid w-64 gap-2">
			<Label htmlFor="email">Email</Label>
			<Input id="email" {...args} type="email" placeholder="you@example.com" />
		</div>
	),
};
