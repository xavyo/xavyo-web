import { describe, it, expect } from 'vitest';
import {
	JsonObjectError,
	isJsonParseError,
	parseJsonArray,
	parseJsonRecord,
	parseJsonStringArray,
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

describe('parseJsonArray', () => {
	it('parses a JSON array', () => {
		expect(parseJsonArray('[1, "a"]')).toEqual([1, 'a']);
	});

	it('rejects objects and scalars', () => {
		expect(() => parseJsonArray('{}')).toThrow(JsonObjectError);
		expect(() => parseJsonArray('null')).toThrow(JsonObjectError);
		expect(() => parseJsonArray('"x"')).toThrow(JsonObjectError);
	});
});

describe('parseJsonStringArray', () => {
	it('parses string arrays', () => {
		expect(parseJsonStringArray('["a","b"]')).toEqual(['a', 'b']);
	});

	it('rejects non-string items', () => {
		expect(() => parseJsonStringArray('[1]')).toThrow(JsonObjectError);
	});
});
