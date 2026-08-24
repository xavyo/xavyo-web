import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	getScriptTemplate: vi.fn(),
	updateScriptTemplate: vi.fn(),
	deleteScriptTemplate: vi.fn()
}));

import { PUT } from './+server';
import { updateScriptTemplate } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { templateId: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/templates/t1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/provisioning-scripts/templates/:templateId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a template with known fields', async () => {
		vi.mocked(updateScriptTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'map' })) as any);
		expect(response.status).toBe(200);
		expect(updateScriptTemplate).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateScriptTemplate).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateScriptTemplate).not.toHaveBeenCalled();
	});
});
