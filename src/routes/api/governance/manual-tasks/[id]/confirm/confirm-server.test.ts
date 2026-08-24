import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/manual-tasks', () => ({
	confirmTask: vi.fn()
}));

import { POST } from './+server';
import { confirmTask } from '$lib/api/manual-tasks';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/manual-tasks/t1/confirm', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/manual-tasks/:id/confirm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('confirms with known fields', async () => {
		vi.mocked(confirmTask).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ notes: 'done' })) as any);
		expect(response.status).toBe(200);
		expect(confirmTask).toHaveBeenCalled();
	});

	it('does not confirm on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(confirmTask).not.toHaveBeenCalled();
	});

	it('does not confirm when notes is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ notes: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(confirmTask).not.toHaveBeenCalled();
	});
});
