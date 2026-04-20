import { Progress } from "@/components/ui/progress";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Progress> = {
	title: "UI/Progress",
	component: Progress,
	args: { value: 33 },
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
	render: (args) => <Progress {...args} className="w-72" />,
};
