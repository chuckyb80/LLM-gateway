import { Logo } from "@/components/ui/logo";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Logo> = {
	title: "UI/Logo",
	component: Logo,
};

export default meta;

type Story = StoryObj<typeof Logo>;

export const Default: Story = {
	render: () => <Logo className="size-16 text-foreground" />,
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-end gap-4 text-foreground">
			<Logo className="size-6" />
			<Logo className="size-10" />
			<Logo className="size-16" />
			<Logo className="size-24" />
		</div>
	),
};
