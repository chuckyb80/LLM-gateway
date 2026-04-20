import { Button } from "@/components/ui/button";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof HoverCard> = {
	title: "UI/HoverCard",
	component: HoverCard,
};

export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
	render: () => (
		<HoverCard>
			<HoverCardTrigger asChild>
				<Button variant="link">@nextjs</Button>
			</HoverCardTrigger>
			<HoverCardContent className="w-72">
				<div className="text-sm">
					<h4 className="font-semibold">@nextjs</h4>
					<p className="text-muted-foreground">
						The React framework – created and maintained by @vercel.
					</p>
				</div>
			</HoverCardContent>
		</HoverCard>
	),
};
