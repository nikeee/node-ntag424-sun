// @ts-check
import ndef from "ndef";
import { parseTemplate } from "url-template";

const placeholder = {
	// 2 chars because hex-ascii-representation will be 2 bytes per byte
	picc: "PI".repeat(16),
	uid: "UI".repeat(7),
	counter: "CT".repeat(3),
	cmac: "CM".repeat(8),
};

/**
 * @param {string} template
 */
function createUrl(template) {
	const invalidSubstrings = Object.values(placeholder);
	for (const substring of invalidSubstrings) {
		if (template.includes(substring)) {
			throw new Error(
				`Template \`${template}\` must not contain the reserved placeholder \`${substring}\`.`,
			);
		}
	}
	return parseTemplate(template).expand(placeholder);
}

/**
 * @typedef {{
 *   buffer: Buffer;
 *   offsets: {
 *     picc: number | null;
 *     uid: number | null;
 *     counter: number | null;
 *     cmac: number | null;
 *   };
 * }} SunNdefMessageData
 */

/**
 * @param {string} template [RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570) URI template
 * @return {SunNdefMessageData}
 */
export function createNdefMessage(template) {
	const url = createUrl(template);
	const bytes = Buffer.from(ndef.encodeMessage([ndef.uriRecord(url)]));

	const buffer = Buffer.alloc(bytes.length + 2);
	buffer.writeUInt16BE(bytes.length);
	bytes.copy(buffer, 2);

	const offsets = {
		picc:
			findValueStartOffset(buffer, Buffer.from(placeholder.picc, "ascii")) ??
			null,
		uid:
			findValueStartOffset(buffer, Buffer.from(placeholder.uid, "ascii")) ??
			null,
		counter:
			findValueStartOffset(buffer, Buffer.from(placeholder.counter, "ascii")) ??
			null,
		cmac:
			findValueStartOffset(buffer, Buffer.from(placeholder.cmac, "ascii")) ??
			null,
	};

	// Replace the placeholders with "*", so it will be more obvious if something goes wrong when debugging
	for (const [fieldName, offset] of Object.entries(offsets)) {
		if (offset === null) {
			continue;
		}

		const placeholderLength = placeholder[fieldName].length;
		buffer.fill("*", offset, offset + placeholderLength, "ascii");
	}

	return {
		buffer,
		offsets,
	};
}

/**
 *
 * @param {Buffer} buffer
 * @param {Buffer} fieldPlaceholder
 * @returns {number | undefined}
 */
function findValueStartOffset(buffer, fieldPlaceholder) {
	const res = buffer.indexOf(fieldPlaceholder, 0, "ascii");
	if (res < 0) {
		return undefined;
	}
	if (res >= buffer.length) {
		throw new Error(`Field "${fieldPlaceholder}" value not found in buffer`);
	}
	return res;
}
