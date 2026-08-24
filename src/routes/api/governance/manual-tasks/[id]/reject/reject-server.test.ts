import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/manual-tasks', () => ({
	rejectTask: vi.fn()
}));

import { POST } from './+server';
import { rejectTask } from '$lib/api/manual-tasks';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/manual-tasks/t1/reject', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/manual-tasks/:id/reject', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rejects with required fields', async () => {
		vi.mocked(rejectTask).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'blocked' })) as any);
		expect(response.status).toBe(200);
		expect(rejectTask).toHaveBeenCalled();
	});

	it('does not reject on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(rejectTask).not.toHaveBeenCalled();
	});

	it('does not reject when reason is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(rejectTask).not.toHaveBeenCalled();
	});
});
