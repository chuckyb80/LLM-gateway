import { ImageZoom } from "@/components/ui/image-zoom";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof ImageZoom> = {
	title: "UI/ImageZoom",
	component: ImageZoom,
};

export default meta;

type Story = StoryObj<typeof ImageZoom>;

export const Default: Story = {
	render: () => (
		<ImageZoom>
			<img
				src="https://picsum.photos/400/300"
				alt="Demo"
				className="rounded-md"
			/>
		</ImageZoom>
	),
};
