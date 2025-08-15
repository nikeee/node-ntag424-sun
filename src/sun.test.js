// @ts-check
import { describe, test } from "node:test";
import { expect } from "expect";

// @ts-expect-error
import ndef from "ndef";

import * as sun from "./sun.js";

describe("SUN", async () => {
	test("NDEF encoding works with offsets", async () => {
		const { buffer, offsets } = sun.createNdefMessage(
			"https://xd.com/x?uid={uid}&counter={counter}&cmac={cmac}",
		);

		expect(buffer).toBeDefined();
		expect(buffer.readInt16BE(0)).toBe(buffer.length - 2);
		expect(offsets).toBeDefined();

		expect(offsets.uid).toBeDefined();
		expect(offsets.uid).not.toBeNull();
		expect(offsets.counter).toBeDefined();
		expect(offsets.counter).not.toBeNull();
		expect(offsets.cmac).toBeDefined();
		expect(offsets.cmac).not.toBeNull();

		// @ts-expect-error
		const uidBuffer = buffer.subarray(offsets.uid, offsets.uid + 14);
		expect(uidBuffer.toString("ascii")).toBe("*".repeat(14));

		// @ts-expect-error
		const counterBuffer = buffer.subarray(offsets.counter, offsets.counter + 6);
		expect(counterBuffer.toString("ascii")).toBe("*".repeat(6));

		// @ts-expect-error
		const cmacBuffer = buffer.subarray(offsets.cmac, offsets.cmac + 16);
		expect(cmacBuffer.toString("ascii")).toBe("*".repeat(16));
	});

	test("NDEF encoding works with partial offsets", async () => {
		const { buffer, offsets } = sun.createNdefMessage(
			"https://xd.com/x?uid={uid}&cmac={cmac}",
		);

		expect(buffer).toBeDefined();
		expect(buffer.readInt16BE(0)).toBe(buffer.length - 2);
		expect(offsets).toBeDefined();

		expect(offsets.uid).toBeDefined();
		expect(offsets.uid).not.toBeNull();
		expect(offsets.counter).toBeNull();
		expect(offsets.cmac).toBeDefined();
		expect(offsets.cmac).not.toBeNull();

		// @ts-expect-error
		const uidBuffer = buffer.subarray(offsets.uid, offsets.uid + 14);
		expect(uidBuffer.toString("ascii")).toBe("*".repeat(14));

		// @ts-expect-error
		const cmacBuffer = buffer.subarray(offsets.cmac, offsets.cmac + 16);
		expect(cmacBuffer.toString("ascii")).toBe("*".repeat(16));
	});

	test("NDEF is valid", async () => {
		const { buffer } = sun.createNdefMessage("https://xd.com/x?uid={uid}");

		const ndefMessage = buffer.subarray(2);

		const message = ndef.decodeMessage(ndefMessage);

		expect(message).not.toBeNull();
		expect(message.length).toBe(1);
		expect(message[0]).toEqual(
			expect.objectContaining({
				type: "U",
				tnf: 1,
				value: "https://xd.com/x?uid=**************",
			}),
		);
		expect(message[0].payload).toBeInstanceOf(Array);
		expect(message[0].payload).toHaveLength(28);
	});

	test("NDEF is valid full", async () => {
		const { buffer } = sun.createNdefMessage(
			"https://xd.com/x?uid={uid}&counter={counter}&cmac={cmac}",
		);

		const ndefMessage = buffer.subarray(2);

		const message = ndef.decodeMessage(ndefMessage);

		expect(message).not.toBeNull();
		expect(message.length).toBe(1);
		expect(message[0]).toEqual(
			expect.objectContaining({
				type: "U",
				tnf: 1,
				value:
					"https://xd.com/x?uid=**************&counter=******&cmac=****************",
			}),
		);
		expect(message[0].payload).toBeInstanceOf(Array);
		expect(message[0].payload).toHaveLength(65);
	});
});
