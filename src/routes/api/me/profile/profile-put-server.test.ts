import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	getProfile: vi.fn(),
	updateProfile: vi.fn()
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

import { PUT } from './+server';
import { updateProfile } from '$lib/api/me';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/me/profile', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/me/profile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a profile with known fields', async () => {
		vi.mocked(updateProfile).mockResolvedValue({ display_name: 'Ada' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ display_name: 'Ada' })) as any);
		expect(response.status).toBe(200);
		expect(updateProfile).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateProfile).not.toHaveBeenCalled();
	});

	it('does not update when display_name is not a string', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ display_name: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateProfile).not.toHaveBeenCalled();
	});
});
