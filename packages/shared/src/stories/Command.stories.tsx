import {
	Calculator,
	Calendar,
	CreditCard,
	Settings,
	Smile,
	User,
} from "lucide-react";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Command> = {
	title: "UI/Command",
	component: Command,
};

export default meta;

type Story = StoryObj<typeof Command>;

export const Default: Story = {
	render: () => (
		<Command className="w-80 rounded-lg border shadow-md">
			<CommandInput placeholder="Type a command or search..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup heading="Suggestions">
					<CommandItem>
						<Calendar className="mr-2 size-4" />
						<span>Calendar</span>
					</CommandItem>
					<CommandItem>
						<Smile className="mr-2 size-4" />
						<span>Search Emoji</span>
					</CommandItem>
					<CommandItem>
						<Calculator className="mr-2 size-4" />
						<span>Calculator</span>
					</CommandItem>
				</CommandGroup>
				<CommandSeparator />
				<CommandGroup heading="Settings">
					<CommandItem>
						<User className="mr-2 size-4" />
						<span>Profile</span>
					</CommandItem>
					<CommandItem>
						<CreditCard className="mr-2 size-4" />
						<span>Billing</span>
					</CommandItem>
					<CommandItem>
						<Settings className="mr-2 size-4" />
						<span>Settings</span>
					</CommandItem>
				</CommandGroup>
			</CommandList>
		</Command>
	),
};
