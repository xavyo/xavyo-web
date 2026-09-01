import { describe, it, expect } from 'vitest';
import {
	JsonObjectError,
	isJsonParseError,
	parseBoundedInteger,
	parseJsonArray,
	parseJsonRecord,
	parseJsonStringArray,
	parseJsonStringRecord,
	parseOptionalBoundedInteger,
	requireFiniteNumber
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

describe('requireFiniteNumber', () => {
	it('accepts finite numbers and numeric strings', () => {
		expect(requireFiniteNumber(1.5, 'score')).toBe(1.5);
		expect(requireFiniteNumber('2', 'score')).toBe(2);
	});

	it('rejects NaN and non-numeric values', () => {
		expect(() => requireFiniteNumber(Number('abc'), 'score')).toThrow(JsonObjectError);
		expect(() => requireFiniteNumber('abc', 'score')).toThrow(JsonObjectError);
		expect(() => requireFiniteNumber(Infinity, 'score')).toThrow(JsonObjectError);
	});
});

describe('parseOptionalBoundedInteger', () => {
	it('returns undefined for empty and parses in-range integers', () => {
		expect(parseOptionalBoundedInteger('', 1, 365, 'days')).toBeUndefined();
		expect(parseOptionalBoundedInteger('7', 1, 365, 'days')).toBe(7);
	});

	it('rejects NaN and out-of-range', () => {
		expect(() => parseOptionalBoundedInteger('abc', 0, 100, 'priority')).toThrow(JsonObjectError);
		expect(() => parseOptionalBoundedInteger(101, 0, 100, 'priority')).toThrow(JsonObjectError);
	});
});

describe('parseBoundedInteger', () => {
	it('parses in-range values and uses fallback for empty', () => {
		expect(parseBoundedInteger('9', 0, 23, 'hour')).toBe(9);
		expect(parseBoundedInteger('', 1, 86400, 'secs', 3600)).toBe(3600);
	});

	it('rejects NaN instead of forwarding it', () => {
		expect(() => parseBoundedInteger('abc', 1, 86400, 'secs', 3600)).toThrow(JsonObjectError);
	});
});
