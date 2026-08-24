import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	getMicroCertification: vi.fn(),
	getMicroCertificationEvents: vi.fn(),
	decideMicroCertification: vi.fn(),
	delegateMicroCertification: vi.fn(),
	skipMicroCertification: vi.fn()
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

import { load } from './+page.server';
import { getMicroCertification, getMicroCertificationEvents } from '$lib/api/micro-certifications';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['user'] }
});

describe('Micro-certification detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns certification and events', async () => {
		vi.mocked(getMicroCertification).mockResolvedValue({ id: 'cert-1' } as any);
		vi.mocked(getMicroCertificationEvents).mockResolvedValue({
			items: [{ id: 'evt-1' }],
			total: 1
		} as any);

		const result = (await load({
			params: { id: 'cert-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.certification.id).toBe('cert-1');
		expect(result.events.items).toHaveLength(1);
	});

	it('fails closed when events API throws', async () => {
		vi.mocked(getMicroCertification).mockResolvedValue({ id: 'cert-1' } as any);
		vi.mocked(getMicroCertificationEvents).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'cert-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status from events', async () => {
		vi.mocked(getMicroCertification).mockResolvedValue({ id: 'cert-1' } as any);
		vi.mocked(getMicroCertificationEvents).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				params: { id: 'cert-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
