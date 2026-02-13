import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import GeneratedReportsTab from './generated-reports-tab.svelte';
import type { GeneratedReport } from '$lib/api/types';

vi.mock('$lib/api/governance-reporting-client', () => ({
	deleteReportClient: vi.fn(),
	cleanupReportsClient: vi.fn()
}));
vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

function makeReport(overrides: Partial<GeneratedReport> = {}): GeneratedReport {
	return {
		id: 'rpt-1',
		tenant_id: 'tid',
		template_id: 'tpl-1',
		name: 'Q1 Access Review',
		status: 'completed',
		parameters: {},
		output_format: 'json',
		record_count: 150,
		file_size_bytes: 2048,
		error_message: null,
		progress_percent: 100,
		started_at: '2026-01-01T00:00:00Z',
		completed_at: '2026-01-01T01:00:00Z',
		generated_by: 'user-1',
		schedule_id: null,
		retention_until: '2026-04-01T00:00:00Z',
		created_at: '2026-01-01T00:00:00Z',
		...overrides
	};
}

describe('GeneratedReportsTab', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Loading state ---

	it('renders loading skeletons when loading=true', () => {
		const { container } = render(GeneratedReportsTab, {
			props: { reports: [], loading: true }
		});
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('does not render table when loading', () => {
		render(GeneratedReportsTab, { props: { reports: [], loading: true } });
		expect(screen.queryByRole('table')).toBeNull();
	});

	// --- Empty state ---

	it('renders empty state when reports is empty', () => {
		render(GeneratedReportsTab, { props: { reports: [], loading: false } });
		expect(screen.getByText('No generated reports.')).toBeTruthy();
	});

	it('shows "0 reports" count when empty', () => {
		render(GeneratedReportsTab, { props: { reports: [], loading: false } });
		expect(screen.getByText('0 reports')).toBeTruthy();
	});

	// --- Report list rendering ---

	it('renders report names', () => {
		const reports = [makeReport()];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('Q1 Access Review')).toBeTruthy();
	});

	it('renders multiple reports', () => {
		const reports = [
			makeReport({ id: 'rpt-1', name: 'Report A' }),
			makeReport({ id: 'rpt-2', name: 'Report B' })
		];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('Report A')).toBeTruthy();
		expect(screen.getByText('Report B')).toBeTruthy();
	});

	it('shows correct report count', () => {
		const reports = [
			makeReport({ id: 'rpt-1', name: 'A' }),
			makeReport({ id: 'rpt-2', name: 'B' }),
			makeReport({ id: 'rpt-3', name: 'C' })
		];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('3 reports')).toBeTruthy();
	});

	it('shows singular "report" for single report', () => {
		const reports = [makeReport()];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('1 report')).toBeTruthy();
	});

	// --- Status badges ---

	it('renders completed status badge', () => {
		const reports = [makeReport({ status: 'completed' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('completed')).toBeTruthy();
	});

	it('renders pending status badge', () => {
		const reports = [makeReport({ status: 'pending' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('pending')).toBeTruthy();
	});

	it('renders generating status with progress', () => {
		const reports = [makeReport({ status: 'generating', progress_percent: 45 })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('generating')).toBeTruthy();
		expect(screen.getByText('45%')).toBeTruthy();
	});

	it('renders failed status badge', () => {
		const reports = [makeReport({ status: 'failed', error_message: 'timeout' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('failed')).toBeTruthy();
	});

	// --- Format display ---

	it('renders output format', () => {
		const reports = [makeReport({ output_format: 'json' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('json')).toBeTruthy();
	});

	it('renders csv output format', () => {
		const reports = [makeReport({ output_format: 'csv' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('csv')).toBeTruthy();
	});

	// --- Record count and size ---

	it('renders record count', () => {
		const reports = [makeReport({ record_count: 150 })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('150')).toBeTruthy();
	});

	it('renders dash for null record count', () => {
		const reports = [makeReport({ record_count: null })];
		render(GeneratedReportsTab, { props: { reports } });
		const dashes = screen.getAllByText('\u2014');
		expect(dashes.length).toBeGreaterThan(0);
	});

	it('formats file size in KB', () => {
		const reports = [makeReport({ file_size_bytes: 2048 })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('2.0 KB')).toBeTruthy();
	});

	it('formats file size in MB', () => {
		const reports = [makeReport({ file_size_bytes: 1048576 * 2 })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('2.0 MB')).toBeTruthy();
	});

	it('formats file size in bytes', () => {
		const reports = [makeReport({ file_size_bytes: 512 })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('512 B')).toBeTruthy();
	});

	it('renders dash for null file size', () => {
		const reports = [makeReport({ file_size_bytes: null, record_count: 10 })];
		render(GeneratedReportsTab, { props: { reports } });
		// At least one dash in the table for file_size
		const dashes = screen.getAllByText('\u2014');
		expect(dashes.length).toBeGreaterThan(0);
	});

	// --- View Data / Delete actions ---

	it('shows View Data button for completed reports', () => {
		const reports = [makeReport({ status: 'completed' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('View Data')).toBeTruthy();
	});

	it('does not show View Data for pending reports', () => {
		const reports = [makeReport({ status: 'pending' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.queryByText('View Data')).toBeNull();
	});

	it('does not show View Data for generating reports', () => {
		const reports = [makeReport({ status: 'generating' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.queryByText('View Data')).toBeNull();
	});

	it('shows Delete button for failed reports', () => {
		const reports = [makeReport({ status: 'failed' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('Delete')).toBeTruthy();
	});

	it('shows Delete button for pending reports', () => {
		const reports = [makeReport({ status: 'pending' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('Delete')).toBeTruthy();
	});

	it('does not show Delete for completed reports', () => {
		const reports = [makeReport({ status: 'completed' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.queryByText('Delete')).toBeNull();
	});

	it('shows Error indicator for failed reports with error_message', () => {
		const reports = [makeReport({ status: 'failed', error_message: 'Query timeout' })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('Error')).toBeTruthy();
	});

	it('does not show Error for failed reports without error_message', () => {
		const reports = [makeReport({ status: 'failed', error_message: null })];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.queryByText('Error')).toBeNull();
	});

	// --- Cleanup button ---

	it('renders Cleanup Expired button', () => {
		render(GeneratedReportsTab, { props: { reports: [], loading: false } });
		expect(screen.getByText('Cleanup Expired')).toBeTruthy();
	});

	// --- Status filter ---

	it('renders status filter dropdown with All statuses option', () => {
		render(GeneratedReportsTab, { props: { reports: [], loading: false } });
		expect(screen.getByText('All statuses')).toBeTruthy();
	});

	it('renders status filter options', () => {
		render(GeneratedReportsTab, { props: { reports: [], loading: false } });
		const select = screen.getByRole('combobox');
		expect(select).toBeTruthy();
		// Options exist
		expect(screen.getByText('Pending')).toBeTruthy();
		expect(screen.getByText('Generating')).toBeTruthy();
		expect(screen.getByText('Completed')).toBeTruthy();
		expect(screen.getByText('Failed')).toBeTruthy();
	});

	// --- Table headers ---

	it('renders table headers', () => {
		const reports = [makeReport()];
		render(GeneratedReportsTab, { props: { reports } });
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByText('Status')).toBeTruthy();
		expect(screen.getByText('Format')).toBeTruthy();
		expect(screen.getByText('Records')).toBeTruthy();
		expect(screen.getByText('Size')).toBeTruthy();
		expect(screen.getByText('Created')).toBeTruthy();
		expect(screen.getByText('Actions')).toBeTruthy();
	});
});
