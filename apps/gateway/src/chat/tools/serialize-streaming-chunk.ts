import type { ImageObject } from "./types.js";

/**
 * Efficiently serializes a streaming chunk to JSON, avoiding multi-MB
 * string copies when the chunk contains large base64 image data.
 *
 * For chunks without images, this delegates to JSON.stringify.
 * For chunks with images that have deferred _mime/_base64 references,
 * this builds the JSON string by embedding the base64 data directly
 * without first creating a concatenated data URL string.
 */
export function serializeStreamingChunk(chunk: any): string {
	// Fast path: no images, use standard serialization
	const images: ImageObject[] | undefined = chunk?.choices?.[0]?.delta?.images;
	if (!images || images.length === 0) {
		return JSON.stringify(chunk);
	}

	// Check if any images have deferred base64 references
	const hasDeferredImages = images.some(
		(img) => (img.image_url as any)._base64,
	);
	if (!hasDeferredImages) {
		return JSON.stringify(chunk);
	}

	// Build the JSON manually to avoid creating intermediate concatenated URL strings.
	// We serialize everything except the images array normally, then splice in the
	// image data using direct string building.

	// Serialize the images array manually
	const imageJsonParts: string[] = [];
	for (const img of images) {
		const imgUrl = img.image_url as any;
		if (imgUrl._mime && imgUrl._base64) {
			// Build JSON directly - base64 data is safe (no JSON escaping needed for A-Za-z0-9+/=)
			imageJsonParts.push(
				`{"type":"image_url","image_url":{"url":"data:${imgUrl._mime};base64,${imgUrl._base64}"}}`,
			);
		} else {
			imageJsonParts.push(JSON.stringify(img));
		}
	}
	const imagesJson = `[${imageJsonParts.join(",")}]`;

	// Build the chunk without images, then splice images in
	const chunkCopy = {
		...chunk,
		choices: chunk.choices.map((choice: any, idx: number) => {
			if (idx === 0 && choice.delta?.images) {
				const { images: _images, ...restDelta } = choice.delta;
				return { ...choice, delta: restDelta };
			}
			return choice;
		}),
	};

	const baseJson = JSON.stringify(chunkCopy);

	// Find the delta object in the serialized JSON and insert images
	// The delta is inside choices[0], we need to add "images":<imagesJson> to it
	const deltaEndIdx = findDeltaObjectEnd(baseJson);
	if (deltaEndIdx === -1) {
		// Fallback: couldn't find delta object, just do full serialization
		// This shouldn't happen but is a safety net
		return JSON.stringify(chunk);
	}

	// Insert images field before the closing } of the delta object
	const hasOtherDeltaFields = baseJson[deltaEndIdx - 1] !== "{";
	const separator = hasOtherDeltaFields ? "," : "";
	return (
		baseJson.slice(0, deltaEndIdx) +
		separator +
		`"images":${imagesJson}` +
		baseJson.slice(deltaEndIdx)
	);
}

/**
 * Finds the position of the closing } of the "delta" object
 * within a serialized streaming chunk JSON string.
 */
function findDeltaObjectEnd(json: string): number {
	const deltaKey = '"delta":{';
	const deltaIdx = json.indexOf(deltaKey);
	if (deltaIdx === -1) {
		return -1;
	}

	// Find the matching closing brace
	let depth = 0;
	let inStr = false;
	for (let i = deltaIdx + deltaKey.length - 1; i < json.length; i++) {
		const c = json[i];
		if (inStr) {
			if (c === "\\") {
				i++;
				continue;
			}
			if (c === '"') {
				inStr = false;
			}
		} else {
			if (c === '"') {
				inStr = true;
			} else if (c === "{") {
				depth++;
			} else if (c === "}") {
				depth--;
				if (depth === 0) {
					return i;
				}
			}
		}
	}
	return -1;
}
