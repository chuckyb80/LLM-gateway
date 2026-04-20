import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Textarea> = {
	title: "UI/Textarea",
	component: Textarea,
	args: { placeholder: "Type your message here." },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithLabel: Story = {
	render: (args) => (
		<div className="grid w-80 gap-2">
			<Label htmlFor="message">Your message</Label>
			<Textarea {...args} id="message" />
		</div>
	),
};

export const Disabled: Story = {
	args: { disabled: true, value: "This textarea is disabled" },
};
