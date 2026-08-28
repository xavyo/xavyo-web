import { describe, it, expect } from 'vitest';
import { listPagination } from './list-pagination';

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
});
