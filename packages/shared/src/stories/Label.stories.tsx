import { Label } from "@/components/ui/label";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Label> = {
	title: "UI/Label",
	component: Label,
	args: { children: "Label text" },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {};
