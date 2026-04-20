import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Tabs> = {
	title: "UI/Tabs",
	component: Tabs,
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
	render: () => (
		<Tabs defaultValue="account" className="w-96">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account" className="mt-4 text-sm">
				Make changes to your account here.
			</TabsContent>
			<TabsContent value="password" className="mt-4 text-sm">
				Change your password here.
			</TabsContent>
		</Tabs>
	),
};
