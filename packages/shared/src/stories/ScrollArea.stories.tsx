import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import type { Meta, StoryObj } from "@storybook/react-vite";

const tags = Array.from({ length: 50 }).map((_, i) => `v1.2.0-beta.${i + 1}`);

const meta: Meta<typeof ScrollArea> = {
	title: "UI/ScrollArea",
	component: ScrollArea,
};

export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
	render: () => (
		<ScrollArea className="h-72 w-48 rounded-md border">
			<div className="p-4">
				<h4 className="mb-4 text-sm font-medium">Tags</h4>
				{tags.map((tag) => (
					<div key={tag}>
						<div className="text-sm">{tag}</div>
						<Separator className="my-2" />
					</div>
				))}
			</div>
		</ScrollArea>
	),
};
