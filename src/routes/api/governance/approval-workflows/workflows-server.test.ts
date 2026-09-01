import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	listApprovalWorkflows: vi.fn(),
	createApprovalWorkflow: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { GET, POST } from './+server';
import { createApprovalWorkflow, listApprovalWorkflows } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/approval-workflows', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/approval-workflows', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised is_active and is_default filters', async () => {
		vi.mocked(listApprovalWorkflows).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/approval-workflows?is_active=true&is_default=false'
			)
		} as any);
		expect(response.status).toBe(200);
		expect(listApprovalWorkflows).toHaveBeenCalledWith(
			expect.objectContaining({ is_active: true, is_default: false }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/approval-workflows', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a workflow with required fields', async () => {
		vi.mocked(createApprovalWorkflow).mockResolvedValue({ id: 'w1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'default' })) as any);
		expect(response.status).toBe(201);
		expect(createApprovalWorkflow).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createApprovalWorkflow).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ is_default: true })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createApprovalWorkflow).not.toHaveBeenCalled();
	});
});
