import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import UsageHistoryTable from './usage-history-table.svelte';
import type { NhiUsageRecord } from '$lib/api/types';

function makeRecord(overrides: Partial<NhiUsageRecord> = {}): NhiUsageRecord {
	return {
		id: 'rec-1',
		nhi_id: 'nhi-1',
		activity_type: 'api_call',
		details: 'Called /v1/users endpoint',
		performed_at: '2026-02-01T10:00:00Z',
		source_ip: '192.168.1.1',
		...overrides
	};
}

describe('UsageHistoryTable', () => {
	afterEach(cleanup);

	it('renders empty state when no records', () => {
		render(UsageHistoryTable, { props: { records: [] } });
		expect(screen.getByText('No usage records')).toBeTruthy();
		expect(screen.getByText('No usage activity has been recorded for this entity.')).toBeTruthy();
	});

	it('renders table headers when records exist', () => {
		render(UsageHistoryTable, { props: { records: [makeRecord()], total: 1 } });
		expect(screen.getByText('Activity')).toBeTruthy();
		expect(screen.getByText('Details')).toBeTruthy();
		expect(screen.getByText('Source IP')).toBeTruthy();
		expect(screen.getByText('Time')).toBeTruthy();
	});

	it('renders record activity type', () => {
		render(UsageHistoryTable, { props: { records: [makeRecord()], total: 1 } });
		expect(screen.getByText('api_call')).toBeTruthy();
	});

	it('renders record details', () => {
		render(UsageHistoryTable, { props: { records: [makeRecord()], total: 1 } });
		expect(screen.getByText('Called /v1/users endpoint')).toBeTruthy();
	});

	it('renders source IP', () => {
		render(UsageHistoryTable, { props: { records: [makeRecord()], total: 1 } });
		expect(screen.getByText('192.168.1.1')).toBeTruthy();
	});

	it('renders total records count', () => {
		render(UsageHistoryTable, { props: { records: [makeRecord()], total: 5 } });
		expect(screen.getByText('5 total records')).toBeTruthy();
	});

	it('renders dash for null details', () => {
		render(UsageHistoryTable, {
			props: { records: [makeRecord({ details: null })], total: 1 }
		});
		const cells = screen.getAllByText('\u2014');
		expect(cells.length).toBeGreaterThanOrEqual(1);
	});

	it('renders dash for null source_ip', () => {
		render(UsageHistoryTable, {
			props: { records: [makeRecord({ source_ip: null })], total: 1 }
		});
		const cells = screen.getAllByText('\u2014');
		expect(cells.length).toBeGreaterThanOrEqual(1);
	});

	it('renders multiple records', () => {
		const records = [
			makeRecord({ id: 'r1', activity_type: 'api_call' }),
			makeRecord({ id: 'r2', activity_type: 'token_refresh' }),
			makeRecord({ id: 'r3', activity_type: 'login' })
		];
		render(UsageHistoryTable, { props: { records, total: 3 } });
		expect(screen.getByText('api_call')).toBeTruthy();
		expect(screen.getByText('token_refresh')).toBeTruthy();
		expect(screen.getByText('login')).toBeTruthy();
	});
});
