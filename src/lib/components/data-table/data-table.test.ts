import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import DataTable from './data-table.svelte';
import { createColumnHelper } from '@tanstack/table-core';
import type { ColumnDef } from '@tanstack/table-core';

interface TestItem {
	id: string;
	name: string;
	email: string;
}

const columnHelper = createColumnHelper<TestItem>();

// Cast needed: render() erases the generic TData parameter to unknown
const testColumns = [
	columnHelper.accessor('name', { header: 'Name' }),
	columnHelper.accessor('email', { header: 'Email' })
] as ColumnDef<TestItem>[] as ColumnDef<unknown, unknown>[];

const testData: TestItem[] = [
	{ id: '1', name: 'Alice', email: 'alice@test.com' },
	{ id: '2', name: 'Bob', email: 'bob@test.com' },
	{ id: '3', name: 'Charlie', email: 'charlie@test.com' }
];

describe('DataTable', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders column headers', () => {
		render(DataTable, {
			props: {
				columns: testColumns,
				data: testData,
				pageCount: 1,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {}
			}
		});
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByText('Email')).toBeTruthy();
	});

	it('renders row data', () => {
		render(DataTable, {
			props: {
				columns: testColumns,
				data: testData,
				pageCount: 1,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {}
			}
		});
		expect(screen.getByText('Alice')).toBeTruthy();
		expect(screen.getByText('bob@test.com')).toBeTruthy();
		expect(screen.getByText('Charlie')).toBeTruthy();
	});

	it('shows empty state when no data', () => {
		render(DataTable, {
			props: {
				columns: testColumns,
				data: [],
				pageCount: 0,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {},
				emptyMessage: 'No items found'
			}
		});
		expect(screen.getByText('No items found')).toBeTruthy();
	});

	it('shows skeleton rows when loading', () => {
		const { container } = render(DataTable, {
			props: {
				columns: testColumns,
				data: [],
				pageCount: 0,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {},
				isLoading: true
			}
		});
		const skeletons = container.querySelectorAll('.animate-pulse');
		// Default 5 skeleton rows × 2 columns = 10 skeleton elements
		expect(skeletons.length).toBe(10);
	});

	it('renders custom number of skeleton rows', () => {
		const { container } = render(DataTable, {
			props: {
				columns: testColumns,
				data: [],
				pageCount: 0,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {},
				isLoading: true,
				skeletonRows: 3
			}
		});
		const skeletons = container.querySelectorAll('.animate-pulse');
		// 3 skeleton rows × 2 columns = 6 skeleton elements
		expect(skeletons.length).toBe(6);
	});

	it('does not show empty message when loading', () => {
		render(DataTable, {
			props: {
				columns: testColumns,
				data: [],
				pageCount: 0,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {},
				isLoading: true,
				emptyMessage: 'No items found'
			}
		});
		expect(screen.queryByText('No items found')).toBeNull();
	});

	it('has overflow-x-auto wrapper for horizontal scroll', () => {
		const { container } = render(DataTable, {
			props: {
				columns: testColumns,
				data: testData,
				pageCount: 1,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {}
			}
		});
		const wrapper = container.querySelector('.overflow-x-auto');
		expect(wrapper).toBeTruthy();
		expect(wrapper?.querySelector('table')).toBeTruthy();
	});

	it('shows pagination controls', () => {
		render(DataTable, {
			props: {
				columns: testColumns,
				data: testData,
				pageCount: 3,
				pagination: { pageIndex: 0, pageSize: 20 },
				onPaginationChange: () => {}
			}
		});
		expect(screen.getByText('Previous')).toBeTruthy();
		expect(screen.getByText('Next')).toBeTruthy();
	});
});
