import { Search } from "lucide-react";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof InputGroup> = {
	title: "UI/InputGroup",
	component: InputGroup,
};

export default meta;

type Story = StoryObj<typeof InputGroup>;

export const WithIcon: Story = {
	render: () => (
		<InputGroup className="w-72">
			<InputGroupAddon align="inline-start">
				<Search />
			</InputGroupAddon>
			<InputGroupInput placeholder="Search..." />
		</InputGroup>
	),
};
