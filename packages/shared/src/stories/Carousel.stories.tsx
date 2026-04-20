import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Carousel> = {
	title: "UI/Carousel",
	component: Carousel,
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
	render: () => (
		<Carousel className="w-64">
			<CarouselContent>
				{Array.from({ length: 5 }).map((_, index) => (
					<CarouselItem key={index}>
						<div className="flex aspect-square items-center justify-center rounded-md border bg-muted text-4xl font-semibold">
							{index + 1}
						</div>
					</CarouselItem>
				))}
			</CarouselContent>
			<CarouselPrevious />
			<CarouselNext />
		</Carousel>
	),
};
