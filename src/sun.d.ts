export type SunNdefMessageData = {
	buffer: Buffer;
	offsets: {
		picc: number | null;
		uid: number | null;
		counter: number | null;
		cmac: number | null;
	};
};

/**
 * @param {string} template [RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570) URI template.
 * @param {Record<string, string>} [extraParameters] Other variables to exand into the URI template.
 */
export function createNdefMessage(
	template: string,
	extraParameters: Record<string, string>,
): SunNdefMessageData;
