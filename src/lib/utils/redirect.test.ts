import { describe, it, expect } from 'vitest';
import { safeInternalPath } from './redirect';

const origin = 'https://app.example.com';

describe('safeInternalPath', () => {
	it('accepts a same-origin absolute path', () => {
		expect(safeInternalPath('/dashboard', origin)).toBe('/dashboard');
	});

	it('preserves query and hash on an internal path', () => {
		expect(safeInternalPath('/oauth/authorize?client_id=1#x', origin)).toBe(
			'/oauth/authorize?client_id=1#x'
		);
	});

	it('rejects protocol-relative URLs that start with //', () => {
		expect(safeInternalPath('//evil.example/phish', origin)).toBeNull();
	});

	it('rejects protocol-relative URLs with a scheme-relative host', () => {
		expect(safeInternalPath('//evil.example', origin)).toBeNull();
	});

	it('rejects an absolute off-origin URL', () => {
		expect(safeInternalPath('https://evil.example/steal', origin)).toBeNull();
	});

	it('rejects backslash-prefixed values', () => {
		expect(safeInternalPath('\\evil.example', origin)).toBeNull();
	});

	it('returns null for empty or missing values', () => {
		expect(safeInternalPath('', origin)).toBeNull();
		expect(safeInternalPath(null, origin)).toBeNull();
		expect(safeInternalPath(undefined, origin)).toBeNull();
		expect(safeInternalPath('   ', origin)).toBeNull();
	});
});
