import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Switch> = {
	title: "UI/Switch",
	component: Switch,
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const WithLabel: Story = {
	render: () => (
		<div className="flex items-center gap-2">
			<Switch id="airplane-mode" />
			<Label htmlFor="airplane-mode">Airplane mode</Label>
		</div>
	),
};

export const Checked: Story = {
	args: { defaultChecked: true },
};

export const Disabled: Story = {
	args: { disabled: true },
};
