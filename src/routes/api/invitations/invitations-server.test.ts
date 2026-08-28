import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/invitations', () => ({
	listInvitations: vi.fn(),
	createInvitation: vi.fn()
}));

import { GET, POST } from './+server';
import { createInvitation, listInvitations } from '$lib/api/invitations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/invitations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/invitations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listInvitations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/invitations?page=2&page_size=10')
		} as any);
		expect(listInvitations).toHaveBeenCalledWith(
			{ status: undefined, email: undefined, limit: 10, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listInvitations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/invitations?limit=abc&offset=nope')
		} as any);
		expect(listInvitations).toHaveBeenCalledWith(
			{ status: undefined, email: undefined, limit: undefined, offset: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/invitations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates an invitation with email', async () => {
		vi.mocked(createInvitation).mockResolvedValue({ id: 'inv-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ email: 'a@b.c' })) as any);
		expect(response.status).toBe(201);
		expect(createInvitation).toHaveBeenCalledWith(
			{ email: 'a@b.c', role: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not invite on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createInvitation).not.toHaveBeenCalled();
	});

	it('does not invite when email is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createInvitation).not.toHaveBeenCalled();
	});
});
