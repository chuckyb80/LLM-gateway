import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Collapsible> = {
	title: "UI/Collapsible",
	component: Collapsible,
};

export default meta;

type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
	render: () => {
		const [open, setOpen] = useState(false);
		return (
			<Collapsible
				open={open}
				onOpenChange={setOpen}
				className="w-72 space-y-2"
			>
				<div className="flex items-center justify-between rounded-md border px-4 py-2">
					<h4 className="text-sm font-semibold">@peduarte starred 3 repos</h4>
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm">
							<ChevronsUpDown className="size-4" />
						</Button>
					</CollapsibleTrigger>
				</div>
				<div className="rounded-md border px-4 py-2 text-sm">
					@radix-ui/primitives
				</div>
				<CollapsibleContent className="space-y-2">
					<div className="rounded-md border px-4 py-2 text-sm">
						@radix-ui/colors
					</div>
					<div className="rounded-md border px-4 py-2 text-sm">
						@stitches/react
					</div>
				</CollapsibleContent>
			</Collapsible>
		);
	},
};
