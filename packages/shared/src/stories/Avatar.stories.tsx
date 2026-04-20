import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Avatar> = {
	title: "UI/Avatar",
	component: Avatar,
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
	render: () => (
		<Avatar>
			<AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	),
};

export const FallbackOnly: Story = {
	render: () => (
		<Avatar>
			<AvatarFallback>JD</AvatarFallback>
		</Avatar>
	),
};

export const Group: Story = {
	render: () => (
		<div className="flex -space-x-2">
			<Avatar>
				<AvatarImage src="https://github.com/shadcn.png" />
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>
			<Avatar>
				<AvatarFallback>CD</AvatarFallback>
			</Avatar>
		</div>
	),
};
