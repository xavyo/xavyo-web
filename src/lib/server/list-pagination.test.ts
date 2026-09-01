import { describe, it, expect } from 'vitest';
import { JsonObjectError } from '$lib/utils/json-record';
import {
	finiteInteger,
	finiteNumber,
	listPagination,
	pagePagination,
	parseBoundedInteger,
	parseOptionalBoundedInteger,
	parsePortNumber
} from './list-pagination';

describe('listPagination', () => {
	it('passes through limit and offset', () => {
		const url = new URL('http://localhost/x?limit=25&offset=50');
		expect(listPagination(url)).toEqual({ limit: 25, offset: 50 });
	});

	it('maps page and page_size onto limit and offset', () => {
		const url = new URL('http://localhost/x?page=3&page_size=10');
		expect(listPagination(url)).toEqual({ limit: 10, offset: 20 });
	});

	it('prefers explicit offset over page', () => {
		const url = new URL('http://localhost/x?page=2&page_size=10&offset=7');
		expect(listPagination(url)).toEqual({ limit: 10, offset: 7 });
	});

	it('drops non-finite limit and offset instead of forwarding NaN', () => {
		const url = new URL('http://localhost/x?limit=abc&offset=nope');
		expect(listPagination(url)).toEqual({ limit: undefined, offset: undefined });
	});
});

describe('pagePagination', () => {
	it('passes through finite page and page_size', () => {
		const url = new URL('http://localhost/x?page=3&page_size=10');
		expect(pagePagination(url)).toEqual({ page: 3, page_size: 10 });
	});

	it('drops non-finite page and page_size instead of forwarding NaN', () => {
		const url = new URL('http://localhost/x?page=abc&page_size=nope');
		expect(pagePagination(url)).toEqual({ page: undefined, page_size: undefined });
	});
});

describe('finiteNumber', () => {
	it('parses finite numeric strings', () => {
		expect(finiteNumber('42')).toBe(42);
		expect(finiteNumber('0')).toBe(0);
	});

	it('drops empty, non-numeric, and non-finite values', () => {
		expect(finiteNumber(null)).toBeUndefined();
		expect(finiteNumber('')).toBeUndefined();
		expect(finiteNumber('abc')).toBeUndefined();
		expect(finiteNumber('Infinity')).toBeUndefined();
	});
});

describe('finiteInteger', () => {
	it('parses integer strings', () => {
		expect(finiteInteger('5')).toBe(5);
		expect(finiteInteger('0')).toBe(0);
	});

	it('drops NaN, floats, and parseInt-style prefixes', () => {
		expect(finiteInteger(undefined)).toBeUndefined();
		expect(finiteInteger('abc')).toBeUndefined();
		expect(finiteInteger('3.5')).toBeUndefined();
		expect(finiteInteger('3abc')).toBeUndefined();
	});
});

describe('parsePortNumber', () => {
	it('parses a valid port and uses fallback for empty', () => {
		expect(parsePortNumber('636', 389)).toBe(636);
		expect(parsePortNumber(389, 636)).toBe(389);
		expect(parsePortNumber('', 636)).toBe(636);
		expect(parsePortNumber(null, 5432)).toBe(5432);
	});

	it('rejects NaN, 0, floats, and out-of-range instead of defaulting', () => {
		expect(() => parsePortNumber('abc', 636)).toThrow(JsonObjectError);
		expect(() => parsePortNumber(0, 636)).toThrow(JsonObjectError);
		expect(() => parsePortNumber('0', 636)).toThrow(JsonObjectError);
		expect(() => parsePortNumber('12.5', 636)).toThrow(JsonObjectError);
		expect(() => parsePortNumber(70000, 636)).toThrow(JsonObjectError);
		expect(() => parsePortNumber(-1, 636)).toThrow(JsonObjectError);
	});
});

describe('parseOptionalBoundedInteger', () => {
	it('returns undefined for empty and parses in-range integers', () => {
		expect(parseOptionalBoundedInteger('', 0, 6, 'day_of_week')).toBeUndefined();
		expect(parseOptionalBoundedInteger(null, 1, 31, 'day_of_month')).toBeUndefined();
		expect(parseOptionalBoundedInteger('0', 0, 6, 'day_of_week')).toBe(0);
		expect(parseOptionalBoundedInteger(15, 1, 31, 'day_of_month')).toBe(15);
	});

	it('rejects NaN and out-of-range instead of forwarding NaN', () => {
		expect(() => parseOptionalBoundedInteger('abc', 0, 6, 'day_of_week')).toThrow(
			JsonObjectError
		);
		expect(() => parseOptionalBoundedInteger('7', 0, 6, 'day_of_week')).toThrow(JsonObjectError);
		expect(() => parseOptionalBoundedInteger('32', 1, 31, 'day_of_month')).toThrow(
			JsonObjectError
		);
	});
});

describe('parseBoundedInteger', () => {
	it('parses in-range values and uses fallback for empty', () => {
		expect(parseBoundedInteger('9', 0, 23, 'hour_of_day')).toBe(9);
		expect(parseBoundedInteger('', 0, 23, 'hour_of_day', 0)).toBe(0);
		expect(parseBoundedInteger(null, 0, 23, 'hour_of_day', 0)).toBe(0);
	});

	it('rejects NaN and out-of-range instead of forwarding NaN', () => {
		expect(() => parseBoundedInteger('abc', 0, 23, 'hour_of_day', 0)).toThrow(JsonObjectError);
		expect(() => parseBoundedInteger('24', 0, 23, 'hour_of_day', 0)).toThrow(JsonObjectError);
		expect(() => parseBoundedInteger('', 0, 23, 'hour_of_day')).toThrow(JsonObjectError);
	});
});
