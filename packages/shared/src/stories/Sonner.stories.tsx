import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Toaster> = {
	title: "UI/Sonner",
	component: Toaster,
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
	render: () => (
		<div>
			<Toaster />
			<div className="flex flex-wrap gap-2">
				<Button onClick={() => toast("Event has been created")}>Default</Button>
				<Button
					variant="outline"
					onClick={() => toast.success("Profile updated")}
				>
					Success
				</Button>
				<Button
					variant="destructive"
					onClick={() => toast.error("Something went wrong")}
				>
					Error
				</Button>
			</div>
		</div>
	),
};
