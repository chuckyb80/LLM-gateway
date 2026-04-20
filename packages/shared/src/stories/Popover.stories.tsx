import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Popover> = {
	title: "UI/Popover",
	component: Popover,
};

export default meta;

type Story = StoryObj<typeof Popover>;

export const Default: Story = {
	render: () => (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open popover</Button>
			</PopoverTrigger>
			<PopoverContent className="w-72">
				<div className="grid gap-2">
					<div className="space-y-1">
						<h4 className="font-medium">Dimensions</h4>
						<p className="text-muted-foreground text-sm">
							Set the dimensions for the layer.
						</p>
					</div>
					<div className="grid gap-2">
						<div className="grid grid-cols-3 items-center gap-4">
							<Label htmlFor="width">Width</Label>
							<Input id="width" defaultValue="100%" className="col-span-2" />
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	),
};
