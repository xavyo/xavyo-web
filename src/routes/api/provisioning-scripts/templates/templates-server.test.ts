import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	listScriptTemplates: vi.fn(),
	createScriptTemplate: vi.fn()
}));

import { GET, POST } from './+server';
import { createScriptTemplate, listScriptTemplates } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/provisioning-scripts/templates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listScriptTemplates).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/provisioning-scripts/templates?page=abc&page_size=nope')
		} as any);
		expect(listScriptTemplates).toHaveBeenCalledWith(
			{ category: undefined, search: undefined, page: undefined, page_size: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/provisioning-scripts/templates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a template with required fields', async () => {
		vi.mocked(createScriptTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'map',
					category: 'attribute_mapping',
					template_body: 'return input'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createScriptTemplate).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createScriptTemplate).not.toHaveBeenCalled();
	});

	it('does not create when category is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'map', category: 'other', template_body: 'x' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createScriptTemplate).not.toHaveBeenCalled();
	});
});
