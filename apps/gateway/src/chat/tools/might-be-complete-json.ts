/**
 * Quick heuristic to check if a string might be complete JSON.
 * Returns false if brackets are definitely unbalanced (avoiding expensive JSON.parse).
 * Returns true if it might be valid (still needs JSON.parse to confirm).
 * This is a performance optimization for SSE parsing where we do many validity checks.
 *
 * For large strings (e.g. base64 image data), we use an optimized approach:
 * scan from both ends inward to find the structural boundaries, avoiding
 * a full O(n) scan of multi-MB payloads.
 */
export function mightBeCompleteJson(str: string): boolean {
	if (str.length === 0) {
		return false;
	}

	// Find first and last non-whitespace characters without calling .trim(),
	// which would allocate a full copy of multi-MB strings.
	let start = 0;
	while (
		start < str.length &&
		(str[start] === " " ||
			str[start] === "\t" ||
			str[start] === "\n" ||
			str[start] === "\r")
	) {
		start++;
	}
	if (start === str.length) {
		return false;
	}

	let end = str.length - 1;
	while (
		end > start &&
		(str[end] === " " ||
			str[end] === "\t" ||
			str[end] === "\n" ||
			str[end] === "\r")
	) {
		end--;
	}

	const firstChar = str[start];
	const lastChar = str[end];
	const trimmedLength = end - start + 1;

	// Quick check: must start with { or [ and end with } or ]
	if (firstChar === "{") {
		if (lastChar !== "}") {
			return false;
		}
	} else if (firstChar === "[") {
		if (lastChar !== "]") {
			return false;
		}
	} else {
		// Not a JSON object or array
		return false;
	}

	// For large payloads (e.g. containing base64 image data), scanning the entire
	// string character-by-character is extremely expensive (O(n) on multi-MB data).
	// Instead, we scan from the start and end inward, only examining the structural
	// JSON boundaries. Large base64 strings in the middle are inside a JSON string
	// value, so we only need to verify the outer structure is balanced.
	//
	// The threshold is set at 100KB - below this, the full scan is fast enough.
	// Above this, payloads almost always contain large opaque string values
	// (base64 images, long text) where scanning every character is wasteful.
	const LARGE_PAYLOAD_THRESHOLD = 100 * 1024;
	if (trimmedLength > LARGE_PAYLOAD_THRESHOLD) {
		return mightBeCompleteJsonLarge(str, start, end);
	}

	// Count brackets/braces, skipping content inside strings
	let braces = 0;
	let brackets = 0;
	let inString = false;
	let i = start;

	while (i <= end) {
		const c = str[i];

		if (inString) {
			if (c === "\\") {
				// Skip escaped character
				i += 2;
				continue;
			} else if (c === '"') {
				inString = false;
			}
		} else {
			if (c === '"') {
				inString = true;
			} else if (c === "{") {
				braces++;
			} else if (c === "}") {
				braces--;
			} else if (c === "[") {
				brackets++;
			} else if (c === "]") {
				brackets--;
			}
		}
		i++;
	}

	// If still in string, the JSON is incomplete
	if (inString) {
		return false;
	}

	return braces === 0 && brackets === 0;
}

/**
 * Optimized heuristic for large JSON payloads (100KB+).
 *
 * Instead of scanning the entire string, we scan from the start until we
 * enter a string value that extends beyond our scan window, then scan backward
 * from the end until we enter the same string. The structural depth counted
 * from each end should match for the JSON to be balanced.
 *
 * This turns an O(n) scan into O(k) where k is the size of the structural
 * JSON skeleton (typically a few hundred bytes even for multi-MB payloads).
 *
 * Accepts start/end indices to avoid creating a trimmed copy of the string.
 */
function mightBeCompleteJsonLarge(
	str: string,
	start: number,
	end: number,
): boolean {
	const SCAN_LIMIT = 8192; // scan at most 8KB from each end

	// Forward scan: count structural depth until we enter a long string
	let fBraces = 0;
	let fBrackets = 0;
	let inString = false;
	let i = start;
	const forwardEnd = Math.min(end + 1, start + SCAN_LIMIT);

	while (i < forwardEnd) {
		const c = str[i];
		if (inString) {
			if (c === "\\") {
				i += 2;
				continue;
			} else if (c === '"') {
				inString = false;
			}
		} else {
			if (c === '"') {
				inString = true;
			} else if (c === "{") {
				fBraces++;
			} else if (c === "}") {
				fBraces--;
			} else if (c === "[") {
				fBrackets++;
			} else if (c === "]") {
				fBrackets--;
			}
		}
		i++;
	}

	// If we finished scanning the entire string (unlikely given >100KB), use result directly
	if (i > end) {
		return !inString && fBraces === 0 && fBrackets === 0;
	}

	// If we're NOT in a string at the forward scan limit, the structural content
	// extends beyond our window in a non-string context. This is unusual for large
	// payloads. Use a conservative approach: the first/last char check already passed.
	if (!inString) {
		return true;
	}

	// We entered a large string value in the forward scan.
	// Now scan backward from the end. The reverse scan counts structural depth
	// from the end until it enters a string going backward (which should be the
	// same string the forward scan entered).
	//
	// For the JSON to be balanced:
	//   - Forward opened fBraces braces before the string
	//   - Reverse should see the same number of closing braces after the string
	//   - Same for brackets
	let rBraces = 0;
	let rBrackets = 0;
	let rInString = false;
	let j = end;
	const reverseEnd = Math.max(start, end - SCAN_LIMIT + 1);

	while (j >= reverseEnd) {
		const c = str[j];
		if (rInString) {
			// Inside a string scanning backward - check for unescaped quote
			if (c === '"') {
				let backslashes = 0;
				let k = j - 1;
				while (k >= start && str[k] === "\\") {
					backslashes++;
					k--;
				}
				if (backslashes % 2 === 0) {
					rInString = false;
				}
			}
			// Once we enter the large string going backward, we've accounted for
			// all the closing structure. Stop scanning.
			if (rInString && j < end - SCAN_LIMIT + 2) {
				// We're deep in the string and past our scan limit - stop
				break;
			}
		} else {
			if (c === '"') {
				rInString = true;
			} else if (c === "}") {
				rBraces++;
			} else if (c === "{") {
				rBraces--;
			} else if (c === "]") {
				rBrackets++;
			} else if (c === "[") {
				rBrackets--;
			}
		}
		j--;
	}

	// Forward scan opened fBraces/fBrackets before entering the string.
	// Reverse scan should have closed the same number after the string.
	// rBraces counts '}' as +1 and '{' as -1, so for balance: fBraces === rBraces
	return fBraces === rBraces && fBrackets === rBrackets;
}
