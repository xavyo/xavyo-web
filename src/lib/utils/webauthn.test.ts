import { describe, it, expect } from 'vitest';
import { bufferToBase64url, base64urlToBuffer } from './webauthn';

describe('bufferToBase64url', () => {
	it('encodes a known test vector', () => {
		const buffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
		expect(bufferToBase64url(buffer)).toBe('SGVsbG8');
	});

	it('handles an empty buffer', () => {
		const buffer = new Uint8Array([]).buffer;
		expect(bufferToBase64url(buffer)).toBe('');
	});

	it('removes padding characters', () => {
		// "A" in base64 is "QQ==" — base64url should strip the trailing "=="
		const buffer = new Uint8Array([65]).buffer;
		const result = bufferToBase64url(buffer);
		expect(result).not.toContain('=');
		expect(result).toBe('QQ');
	});

	it('replaces + with - and / with _', () => {
		// Bytes that produce + and / in standard base64: 0xFB, 0xEF, 0xBE
		// btoa of [251, 239, 190] = "+++++/++..." — let's use a known pair
		// 0x3E = 62 -> in base64 char '+', 0x3F = 63 -> in base64 char '/'
		// Three bytes [0, 63, 255] => base64 "AD//", base64url "AD__"
		const buffer = new Uint8Array([0, 63, 255]).buffer;
		const result = bufferToBase64url(buffer);
		expect(result).not.toContain('+');
		expect(result).not.toContain('/');
	});
});

describe('base64urlToBuffer', () => {
	it('decodes a known test vector', () => {
		const buffer = base64urlToBuffer('SGVsbG8');
		const bytes = new Uint8Array(buffer);
		expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111]);
	});

	it('handles an empty string', () => {
		const buffer = base64urlToBuffer('');
		expect(new Uint8Array(buffer).length).toBe(0);
	});

	it('handles base64url with - and _ characters', () => {
		// Encode bytes that would produce + and / in standard base64
		const original = new Uint8Array([0, 63, 255]).buffer;
		const encoded = bufferToBase64url(original);
		const decoded = base64urlToBuffer(encoded);
		expect(Array.from(new Uint8Array(decoded))).toEqual([0, 63, 255]);
	});
});

describe('roundtrip', () => {
	it('roundtrips an empty buffer', () => {
		const original = new Uint8Array([]).buffer;
		const encoded = bufferToBase64url(original);
		const decoded = base64urlToBuffer(encoded);
		expect(new Uint8Array(decoded).length).toBe(0);
	});

	it('roundtrips arbitrary binary data', () => {
		const data = new Uint8Array(256);
		for (let i = 0; i < 256; i++) {
			data[i] = i;
		}
		const encoded = bufferToBase64url(data.buffer);
		const decoded = base64urlToBuffer(encoded);
		expect(Array.from(new Uint8Array(decoded))).toEqual(Array.from(data));
	});

	it('roundtrips a WebAuthn-like challenge (32 random bytes)', () => {
		const challenge = new Uint8Array([
			0x9a, 0x2b, 0x3c, 0x4d, 0x5e, 0x6f, 0x70, 0x81, 0x92, 0xa3, 0xb4, 0xc5, 0xd6, 0xe7,
			0xf8, 0x09, 0x1a, 0x2b, 0x3c, 0x4d, 0x5e, 0x6f, 0x70, 0x81, 0x92, 0xa3, 0xb4, 0xc5,
			0xd6, 0xe7, 0xf8, 0x09
		]);
		const encoded = bufferToBase64url(challenge.buffer);
		const decoded = base64urlToBuffer(encoded);
		expect(Array.from(new Uint8Array(decoded))).toEqual(Array.from(challenge));
	});
});
