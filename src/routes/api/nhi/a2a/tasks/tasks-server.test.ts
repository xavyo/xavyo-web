import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/a2a', () => ({
	listA2aTasks: vi.fn(),
	createA2aTask: vi.fn()
}));

import { GET, POST } from './+server';
import { createA2aTask, listA2aTasks } from '$lib/api/a2a';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/a2a/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/nhi/a2a/tasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listA2aTasks).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/a2a/tasks?page=2&page_size=10')
		} as any);
		expect(listA2aTasks).toHaveBeenCalledWith(
			{ state: undefined, target_agent_id: undefined, limit: 10, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/nhi/a2a/tasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a task with required fields', async () => {
		vi.mocked(createA2aTask).mockResolvedValue({ task_id: 't1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					target_agent_id: 'a1',
					task_type: 'summarize',
					input: { text: 'hello' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createA2aTask).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createA2aTask).not.toHaveBeenCalled();
	});

	it('does not create when input is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ target_agent_id: 'a1', task_type: 'summarize' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createA2aTask).not.toHaveBeenCalled();
	});
});
