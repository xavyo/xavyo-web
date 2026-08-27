import { describe, it, expect } from 'vitest';
import {
	JsonObjectError,
	isJsonParseError,
	parseJsonRecord,
	parseJsonStringRecord
} from './json-record';

describe('parseJsonRecord', () => {
	it('parses a JSON object', () => {
		expect(parseJsonRecord('{"a": 1}')).toEqual({ a: 1 });
	});

	it('rejects arrays', () => {
		expect(() => parseJsonRecord('[]')).toThrow(JsonObjectError);
		expect(() => parseJsonRecord('["x"]')).toThrow(JsonObjectError);
	});

	it('rejects null and scalars', () => {
		expect(() => parseJsonRecord('null')).toThrow(JsonObjectError);
		expect(() => parseJsonRecord('"str"')).toThrow(JsonObjectError);
		expect(() => parseJsonRecord('1')).toThrow(JsonObjectError);
	});

	it('rejects invalid JSON', () => {
		expect(() => parseJsonRecord('not json')).toThrow(SyntaxError);
	});
});

describe('parseJsonStringRecord', () => {
	it('parses string-valued objects', () => {
		expect(parseJsonStringRecord('{"email": "mail"}')).toEqual({ email: 'mail' });
	});

	it('rejects non-string values', () => {
		expect(() => parseJsonStringRecord('{"a": 1}')).toThrow(JsonObjectError);
	});
});

describe('isJsonParseError', () => {
	it('matches SyntaxError and JsonObjectError', () => {
		expect(isJsonParseError(new SyntaxError('bad'))).toBe(true);
		expect(isJsonParseError(new JsonObjectError())).toBe(true);
		expect(isJsonParseError(new Error('other'))).toBe(false);
	});
});
