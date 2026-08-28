import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listApplications: vi.fn(),
	createApplication: vi.fn()
}));

import { GET, POST } from './+server';
import { createApplication, listApplications } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/applications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/applications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listApplications).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/applications?page=4&page_size=5')
		} as any);
		expect(response.status).toBe(200);
		expect(listApplications).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 5, offset: 15 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/applications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates an application with required fields', async () => {
		vi.mocked(createApplication).mockResolvedValue({ id: 'a1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'App', app_type: 'internal' })) as any
		);
		expect(response.status).toBe(201);
		expect(createApplication).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createApplication).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ app_type: 'internal' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createApplication).not.toHaveBeenCalled();
	});
});
