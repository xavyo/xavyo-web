import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	generateOutlierReport: vi.fn()
}));

import { POST } from './+server';
import { generateOutlierReport } from '$lib/api/outliers';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/outliers/reports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/outliers/reports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('generates a report with required fields', async () => {
		vi.mocked(generateOutlierReport).mockResolvedValue({ total_analyses: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ start_date: '2026-01-01', end_date: '2026-01-31' })) as any
		);
		expect(response.status).toBe(200);
		expect(generateOutlierReport).toHaveBeenCalled();
	});

	it('does not generate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(generateOutlierReport).not.toHaveBeenCalled();
	});

	it('does not generate when start_date is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ end_date: '2026-01-31' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(generateOutlierReport).not.toHaveBeenCalled();
	});
});
