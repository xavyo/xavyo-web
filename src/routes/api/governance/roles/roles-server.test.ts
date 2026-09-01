import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	listRoles: vi.fn(),
	createRole: vi.fn()
}));

import { GET, POST } from './+server';
import { createRole, listRoles } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/roles', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listRoles).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/roles?page=2&page_size=25')
		} as any);
		expect(listRoles).toHaveBeenCalledWith(
			{
				parent_role_id: undefined,
				is_abstract: undefined,
				name: undefined,
				application_id: undefined,
				limit: 25,
				offset: 25
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised role list filters', async () => {
		vi.mocked(listRoles).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/roles?parent_role_id=null&is_abstract=true&name=admin&application_id=app-1'
			)
		} as any);
		expect(listRoles).toHaveBeenCalledWith(
			expect.objectContaining({
				parent_role_id: 'null',
				is_abstract: true,
				name: 'admin',
				application_id: 'app-1'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/roles', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a role with required fields', async () => {
		vi.mocked(createRole).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'admin' })) as any);
		expect(response.status).toBe(201);
		expect(createRole).toHaveBeenCalled();
	});

	it('forwards advertised is_abstract on create', async () => {
		vi.mocked(createRole).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'admin', is_abstract: true })) as any
		);
		expect(response.status).toBe(201);
		expect(createRole).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'admin', is_abstract: true }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createRole).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ description: 'x' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createRole).not.toHaveBeenCalled();
	});
});
