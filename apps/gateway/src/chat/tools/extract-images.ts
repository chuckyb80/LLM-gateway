import type { ImageObject } from "./types.js";
import type { Provider } from "@llmgateway/models";

/**
 * Extracts images from streaming data based on provider format.
 *
 * For large base64 image data, we store mimeType and data separately
 * to avoid creating concatenated multi-MB URL strings. The URL is
 * constructed lazily only when needed (e.g. for non-streaming responses).
 */
export function extractImages(data: any, provider: Provider): ImageObject[] {
	switch (provider) {
		case "google-ai-studio":
		case "google-vertex":
		case "obsidian": {
			const parts = data.candidates?.[0]?.content?.parts ?? [];
			const imageParts = parts.filter((part: any) => part.inlineData);
			return imageParts.map(
				(part: any): ImageObject => ({
					type: "image_url",
					image_url: {
						// Store references to avoid multi-MB string concatenation.
						// The _mime and _base64 fields allow serialization without
						// creating an intermediate concatenated URL string.
						url: "",
						_mime: part.inlineData.mimeType,
						_base64: part.inlineData.data,
					},
				}),
			);
		}
		default: // OpenAI format
			return [];
	}
}

/**
 * Serializes an image object to a JSON string fragment without creating
 * an intermediate concatenated data URL. This avoids allocating multi-MB
 * strings just to immediately re-serialize them.
 */
export function serializeImageObject(img: ImageObject): string {
	const imgUrl = img.image_url as any;
	if (imgUrl._mime && imgUrl._base64) {
		// Build the JSON directly, embedding the base64 data in place
		return `{"type":"image_url","image_url":{"url":"data:${imgUrl._mime};base64,${imgUrl._base64}"}}`;
	}
	return JSON.stringify(img);
}
