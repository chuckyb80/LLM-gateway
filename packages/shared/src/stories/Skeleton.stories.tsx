import { Skeleton } from "@/components/ui/skeleton";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Skeleton> = {
	title: "UI/Skeleton",
	component: Skeleton,
};

export default meta;

type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
	render: () => (
		<div className="flex items-center space-x-4">
			<Skeleton className="h-12 w-12 rounded-full" />
			<div className="space-y-2">
				<Skeleton className="h-4 w-64" />
				<Skeleton className="h-4 w-48" />
			</div>
		</div>
	),
};
