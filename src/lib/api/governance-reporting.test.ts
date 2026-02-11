import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	apiClient: vi.fn()
}));

import { apiClient } from './client';
import {
	listTemplates,
	getTemplate,
	createTemplate,
	updateTemplate,
	archiveTemplate,
	cloneTemplate,
	listReports,
	generateReport,
	getReport,
	getReportData,
	deleteReport,
	cleanupReports,
	listSchedules,
	getSchedule,
	createSchedule,
	updateSchedule,
	deleteSchedule,
	pauseSchedule,
	resumeSchedule
} from './governance-reporting';

const mockApiClient = vi.mocked(apiClient);

beforeEach(() => {
	vi.clearAllMocks();
});

describe('Template API', () => {
	it('listTemplates sends GET with query params', async () => {
		mockApiClient.mockResolvedValue({ items: [], total: 0, page: 0, page_size: 50 });
		await listTemplates({ template_type: 'access_review', limit: 10 }, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates?template_type=access_review&limit=10',
			expect.objectContaining({ method: 'GET', token: 'tok', tenantId: 'tid' })
		);
	});

	it('listTemplates with no params sends no query string', async () => {
		mockApiClient.mockResolvedValue({ items: [], total: 0, page: 0, page_size: 50 });
		await listTemplates({}, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('getTemplate sends GET to /templates/:id', async () => {
		mockApiClient.mockResolvedValue({ id: 't1' });
		await getTemplate('t1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates/t1',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('createTemplate sends POST with body', async () => {
		const body = {
			name: 'Test',
			template_type: 'access_review' as const,
			definition: {
				data_sources: ['users'],
				filters: [],
				columns: [],
				grouping: [],
				default_sort: null
			}
		};
		mockApiClient.mockResolvedValue({ id: 't2' });
		await createTemplate(body, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates',
			expect.objectContaining({ method: 'POST', body })
		);
	});

	it('updateTemplate sends PUT to /templates/:id', async () => {
		const body = { name: 'Updated' };
		mockApiClient.mockResolvedValue({ id: 't1' });
		await updateTemplate('t1', body, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates/t1',
			expect.objectContaining({ method: 'PUT', body })
		);
	});

	it('archiveTemplate sends DELETE to /templates/:id', async () => {
		mockApiClient.mockResolvedValue({ id: 't1', status: 'archived' });
		await archiveTemplate('t1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates/t1',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('cloneTemplate sends POST to /templates/:id/clone', async () => {
		const body = { name: 'Clone' };
		mockApiClient.mockResolvedValue({ id: 't3' });
		await cloneTemplate('t1', body, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/templates/t1/clone',
			expect.objectContaining({ method: 'POST', body })
		);
	});
});

describe('Report API', () => {
	it('listReports sends GET with filters', async () => {
		mockApiClient.mockResolvedValue({ items: [], total: 0, page: 0, page_size: 50 });
		await listReports({ status: 'completed', limit: 20 }, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports?status=completed&limit=20',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('generateReport sends POST to /generate', async () => {
		const body = {
			template_id: 't1',
			output_format: 'json' as const
		};
		mockApiClient.mockResolvedValue({ id: 'r1', status: 'completed' });
		await generateReport(body, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/generate',
			expect.objectContaining({ method: 'POST', body })
		);
	});

	it('getReport sends GET to /reports/:id', async () => {
		mockApiClient.mockResolvedValue({ id: 'r1' });
		await getReport('r1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/r1',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('getReportData sends GET to /reports/:id/data', async () => {
		mockApiClient.mockResolvedValue([{ name: 'test' }]);
		await getReportData('r1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/r1/data',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('deleteReport sends DELETE to /reports/:id', async () => {
		mockApiClient.mockResolvedValue(undefined);
		await deleteReport('r1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/r1',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('cleanupReports sends POST to /cleanup', async () => {
		mockApiClient.mockResolvedValue({ deleted_count: 3 });
		await cleanupReports('tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/cleanup',
			expect.objectContaining({ method: 'POST' })
		);
	});
});

describe('Schedule API', () => {
	it('listSchedules sends GET with filters', async () => {
		mockApiClient.mockResolvedValue({ items: [], total: 0, page: 0, page_size: 50 });
		await listSchedules({ status: 'active' }, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules?status=active',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('getSchedule sends GET to /schedules/:id', async () => {
		mockApiClient.mockResolvedValue({ id: 's1' });
		await getSchedule('s1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules/s1',
			expect.objectContaining({ method: 'GET' })
		);
	});

	it('createSchedule sends POST with body', async () => {
		const body = {
			template_id: 't1',
			name: 'Daily SOX',
			frequency: 'daily' as const,
			schedule_hour: 8,
			recipients: ['admin@test.com'],
			output_format: 'json' as const
		};
		mockApiClient.mockResolvedValue({ id: 's1' });
		await createSchedule(body, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules',
			expect.objectContaining({ method: 'POST', body })
		);
	});

	it('updateSchedule sends PUT to /schedules/:id', async () => {
		const body = { name: 'Updated Schedule' };
		mockApiClient.mockResolvedValue({ id: 's1' });
		await updateSchedule('s1', body, 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules/s1',
			expect.objectContaining({ method: 'PUT', body })
		);
	});

	it('deleteSchedule sends DELETE to /schedules/:id', async () => {
		mockApiClient.mockResolvedValue(undefined);
		await deleteSchedule('s1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules/s1',
			expect.objectContaining({ method: 'DELETE' })
		);
	});

	it('pauseSchedule sends POST to /schedules/:id/pause', async () => {
		mockApiClient.mockResolvedValue({ id: 's1', status: 'paused' });
		await pauseSchedule('s1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules/s1/pause',
			expect.objectContaining({ method: 'POST' })
		);
	});

	it('resumeSchedule sends POST to /schedules/:id/resume', async () => {
		mockApiClient.mockResolvedValue({ id: 's1', status: 'active' });
		await resumeSchedule('s1', 'tok', 'tid');
		expect(mockApiClient).toHaveBeenCalledWith(
			'/governance/reports/schedules/s1/resume',
			expect.objectContaining({ method: 'POST' })
		);
	});
});
