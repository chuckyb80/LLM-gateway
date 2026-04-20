import { Download, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"destructive",
				"outline",
				"secondary",
				"ghost",
				"link",
			],
		},
		size: {
			control: "select",
			options: ["default", "sm", "lg", "icon"],
		},
		disabled: { control: "boolean" },
	},
	args: {
		children: "Button",
	},
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Destructive: Story = {
	args: { variant: "destructive", children: "Delete" },
};

export const Outline: Story = {
	args: { variant: "outline" },
};

export const Secondary: Story = {
	args: { variant: "secondary" },
};

export const Ghost: Story = {
	args: { variant: "ghost" },
};

export const Link: Story = {
	args: { variant: "link" },
};

export const Small: Story = {
	args: { size: "sm" },
};

export const Large: Story = {
	args: { size: "lg" },
};

export const WithIcon: Story = {
	args: {
		children: (
			<>
				<Download />
				Download
			</>
		),
	},
};

export const Loading: Story = {
	args: {
		disabled: true,
		children: (
			<>
				<Loader2 className="animate-spin" />
				Loading
			</>
		),
	},
};

export const IconOnly: Story = {
	args: {
		size: "icon",
		variant: "outline",
		children: <Trash2 />,
	},
};

export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-2">
			<Button>Default</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	),
};
