import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	listTriggerRules: vi.fn(),
	createTriggerRule: vi.fn()
}));

import { GET, POST } from './+server';
import { createTriggerRule, listTriggerRules } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/triggers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/micro-certifications/triggers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(listTriggerRules).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/micro-certifications/triggers')
		} as any);
		expect(response.status).toBe(200);
		expect(listTriggerRules).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listTriggerRules).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/micro-certifications/triggers?page=2&page_size=10'
			)
		} as any);
		expect(listTriggerRules).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 10, offset: 10 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/micro-certifications/triggers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a trigger with required fields', async () => {
		vi.mocked(createTriggerRule).mockResolvedValue({ id: 'tr1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'high risk',
					trigger_type: 'high_risk_assignment',
					scope_type: 'tenant',
					reviewer_type: 'user_manager'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTriggerRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createTriggerRule).not.toHaveBeenCalled();
	});

	it('accepts numeric-string timeout_secs and priority', async () => {
		vi.mocked(createTriggerRule).mockResolvedValue({ id: 'tr1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'high risk',
					trigger_type: 'high_risk_assignment',
					scope_type: 'tenant',
					reviewer_type: 'user_manager',
					timeout_secs: '3600',
					priority: '2'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTriggerRule).toHaveBeenCalledWith(
			expect.objectContaining({ timeout_secs: 3600, priority: 2 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN timeout_secs instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'high risk',
						trigger_type: 'high_risk_assignment',
						scope_type: 'tenant',
						reviewer_type: 'user_manager',
						timeout_secs: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTriggerRule).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						trigger_type: 'high_risk_assignment',
						scope_type: 'tenant',
						reviewer_type: 'user_manager'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTriggerRule).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createTriggerRule).mockResolvedValue({ id: 'tr1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'high risk',
					trigger_type: 'high_risk_assignment',
					scope_type: 'tenant',
					reviewer_type: 'user_manager'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTriggerRule).toHaveBeenCalled();
	});
});
