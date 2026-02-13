import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	fetchTemplates,
	cloneTemplateClient,
	archiveTemplateClient,
	fetchReports,
	fetchReportData,
	generateReportClient,
	deleteReportClient,
	cleanupReportsClient,
	fetchSchedules,
	pauseScheduleClient,
	resumeScheduleClient,
	deleteScheduleClient
} from './governance-reporting-client';

function mockFetch(data: unknown, ok = true, status = 200) {
	return vi.fn().mockResolvedValue({
		ok,
		status,
		json: () => Promise.resolve(data)
	});
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('Template client API', () => {
	it('fetchTemplates calls /api/governance/reports/templates', async () => {
		const fn = mockFetch({ items: [], total: 0 });
		await fetchTemplates({}, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/templates');
	});

	it('fetchTemplates with filters appends query string', async () => {
		const fn = mockFetch({ items: [], total: 0 });
		await fetchTemplates({ template_type: 'access_review', limit: 10 }, fn);
		expect(fn).toHaveBeenCalledWith(
			'/api/governance/reports/templates?template_type=access_review&limit=10'
		);
	});

	it('cloneTemplateClient POSTs to /templates/:id/clone', async () => {
		const fn = mockFetch({ id: 't2' });
		await cloneTemplateClient('t1', { name: 'Clone' }, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/templates/t1/clone', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Clone' })
		});
	});

	it('archiveTemplateClient DELETEs /templates/:id', async () => {
		const fn = mockFetch({ id: 't1', status: 'archived' });
		await archiveTemplateClient('t1', fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/templates/t1', {
			method: 'DELETE'
		});
	});

	it('fetchTemplates throws on non-ok response', async () => {
		const fn = mockFetch(null, false, 500);
		await expect(fetchTemplates({}, fn)).rejects.toThrow('Failed to fetch templates: 500');
	});
});

describe('Report client API', () => {
	it('fetchReports calls /api/governance/reports', async () => {
		const fn = mockFetch({ items: [], total: 0 });
		await fetchReports({}, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports');
	});

	it('fetchReports with status filter', async () => {
		const fn = mockFetch({ items: [], total: 0 });
		await fetchReports({ status: 'completed' }, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports?status=completed');
	});

	it('fetchReportData calls /api/governance/reports/:id/data', async () => {
		const fn = mockFetch([{ name: 'row1' }]);
		await fetchReportData('r1', fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/r1/data');
	});

	it('generateReportClient POSTs to /api/governance/reports', async () => {
		const fn = mockFetch({ id: 'r1', status: 'completed' });
		await generateReportClient({ template_id: 't1', output_format: 'json' }, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ template_id: 't1', output_format: 'json' })
		});
	});

	it('deleteReportClient DELETEs /api/governance/reports/:id', async () => {
		const fn = mockFetch(null, true, 204);
		await deleteReportClient('r1', fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/r1', { method: 'DELETE' });
	});

	it('cleanupReportsClient POSTs to /api/governance/reports/cleanup', async () => {
		const fn = mockFetch({ deleted_count: 5 });
		const result = await cleanupReportsClient(fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/cleanup', { method: 'POST' });
		expect(result.deleted_count).toBe(5);
	});

	it('fetchReportData throws on non-ok response', async () => {
		const fn = mockFetch(null, false, 400);
		await expect(fetchReportData('r1', fn)).rejects.toThrow(
			'Failed to fetch report data: 400'
		);
	});
});

describe('Schedule client API', () => {
	it('fetchSchedules calls /api/governance/reports/schedules', async () => {
		const fn = mockFetch({ items: [], total: 0 });
		await fetchSchedules({}, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/schedules');
	});

	it('fetchSchedules with status filter', async () => {
		const fn = mockFetch({ items: [], total: 0 });
		await fetchSchedules({ status: 'active' }, fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/schedules?status=active');
	});

	it('pauseScheduleClient POSTs to /schedules/:id/pause', async () => {
		const fn = mockFetch({ id: 's1', status: 'paused' });
		await pauseScheduleClient('s1', fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/schedules/s1/pause', {
			method: 'POST'
		});
	});

	it('resumeScheduleClient POSTs to /schedules/:id/resume', async () => {
		const fn = mockFetch({ id: 's1', status: 'active' });
		await resumeScheduleClient('s1', fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/schedules/s1/resume', {
			method: 'POST'
		});
	});

	it('deleteScheduleClient DELETEs /schedules/:id', async () => {
		const fn = mockFetch(null, true, 204);
		await deleteScheduleClient('s1', fn);
		expect(fn).toHaveBeenCalledWith('/api/governance/reports/schedules/s1', {
			method: 'DELETE'
		});
	});

	it('pauseScheduleClient throws on non-ok response', async () => {
		const fn = mockFetch(null, false, 400);
		await expect(pauseScheduleClient('s1', fn)).rejects.toThrow(
			'Failed to pause schedule: 400'
		);
	});
});
