import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import VersionDiff from './version-diff.svelte';
import type { VersionCompareResponse } from '$lib/api/types';

describe('VersionDiff', () => {
	afterEach(cleanup);

	it('renders placeholder message when diff is null', () => {
		render(VersionDiff, { props: { diff: null } });
		expect(screen.getByText('Select two versions to compare.')).toBeTruthy();
	});

	it('renders version comparison header', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 3,
			diff_lines: []
		};
		render(VersionDiff, { props: { diff } });
		expect(screen.getByText(/Comparing version 1 → 3/)).toBeTruthy();
	});

	it('renders diff lines with content', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 1, change_type: 'unchanged', content: 'const x = 1;' },
				{ line_number: 2, change_type: 'removed', content: 'const y = 2;' },
				{ line_number: 3, change_type: 'added', content: 'const y = 3;' }
			]
		};
		render(VersionDiff, { props: { diff } });
		expect(screen.getByText('const x = 1;')).toBeTruthy();
		expect(screen.getByText('const y = 2;')).toBeTruthy();
		expect(screen.getByText('const y = 3;')).toBeTruthy();
	});

	it('renders line numbers', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 5, change_type: 'unchanged', content: 'some code' }
			]
		};
		render(VersionDiff, { props: { diff } });
		expect(screen.getByText('5')).toBeTruthy();
	});

	it('renders "+" indicator for added lines', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 1, change_type: 'added', content: 'new line' }
			]
		};
		render(VersionDiff, { props: { diff } });
		expect(screen.getByText('+')).toBeTruthy();
	});

	it('renders "-" indicator for removed lines', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 1, change_type: 'removed', content: 'old line' }
			]
		};
		render(VersionDiff, { props: { diff } });
		expect(screen.getByText('-')).toBeTruthy();
	});

	it('applies green background for added lines', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 1, change_type: 'added', content: 'new line' }
			]
		};
		const { container } = render(VersionDiff, { props: { diff } });
		const addedRow = container.querySelector('tr.bg-green-50');
		expect(addedRow).toBeTruthy();
	});

	it('applies red background for removed lines', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 1, change_type: 'removed', content: 'old line' }
			]
		};
		const { container } = render(VersionDiff, { props: { diff } });
		const removedRow = container.querySelector('tr.bg-red-50');
		expect(removedRow).toBeTruthy();
	});

	it('does not apply colored background for unchanged lines', () => {
		const diff: VersionCompareResponse = {
			version_a: 1,
			version_b: 2,
			diff_lines: [
				{ line_number: 1, change_type: 'unchanged', content: 'same' }
			]
		};
		const { container } = render(VersionDiff, { props: { diff } });
		const rows = container.querySelectorAll('tr');
		const row = rows[0];
		expect(row?.classList.contains('bg-green-50')).toBe(false);
		expect(row?.classList.contains('bg-red-50')).toBe(false);
	});
});
