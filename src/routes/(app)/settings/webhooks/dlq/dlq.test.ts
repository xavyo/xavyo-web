import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/webhooks', () => ({
	listDlqEntries: vi.fn(),
	replayDlqEntry: vi.fn(),
	deleteDlqEntry: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import { listDlqEntries, replayDlqEntry, deleteDlqEntry } from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeDlqEntry = (overrides: Record<string, unknown> = {}) => ({
	id: 'dlq-1',
	subscription_id: 'sub-1',
	event_type: 'user.created',
	error_message: 'Connection refused',
	retry_count: 3,
	created_at: '2026-01-01T00:00:00Z',
	...overrides
});

// =============================================================================
// DLQ List Page
// =============================================================================

describe('DLQ +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/settings/webhooks/dlq'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns DLQ entries for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listDlqEntries).mockResolvedValue({
				entries: [makeDlqEntry()],
				total: 1,
				has_more: false
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks/dlq'),
				fetch: vi.fn()
			} as any);

			expect(result.entries).toHaveLength(1);
			expect(result.entries[0].event_type).toBe('user.created');
			expect(result.total).toBe(1);
		});

		it('reads pagination from URL params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listDlqEntries).mockResolvedValue({ entries: [], total: 0, has_more: false } as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks/dlq?limit=10&offset=20'),
				fetch: vi.fn()
			} as any);

			expect(listDlqEntries).toHaveBeenCalledWith(
				{ limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listDlqEntries).mockRejectedValue(new Error('fail'));

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks/dlq'),
				fetch: vi.fn()
			} as any);

			expect(result.entries).toEqual([]);
			expect(result.total).toBe(0);
		});
	});

	describe('actions', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		// --- Replay ---

		it('replay action calls replayDlqEntry with correct params', async () => {
			vi.mocked(replayDlqEntry).mockResolvedValue(undefined as any);

			const formData = new FormData();
			formData.set('id', 'dlq-1');

			const result = await actions.replay({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(replayDlqEntry).toHaveBeenCalledWith('dlq-1', 'tok', 'tid', expect.any(Function));
			expect(result).toEqual({ success: true, action: 'replay' });
		});

		it('replay action returns error when id is missing', async () => {
			const formData = new FormData();

			const result = await actions.replay({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Missing DLQ entry ID' });
		});

		it('replay action returns ApiError message', async () => {
			vi.mocked(replayDlqEntry).mockRejectedValue(new ApiError('Entry expired', 410));

			const formData = new FormData();
			formData.set('id', 'dlq-1');

			const result = await actions.replay({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Entry expired' });
		});

		it('replay action returns generic error for non-ApiError', async () => {
			vi.mocked(replayDlqEntry).mockRejectedValue(new Error('network'));

			const formData = new FormData();
			formData.set('id', 'dlq-1');

			const result = await actions.replay({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Failed to replay DLQ entry' });
		});

		// --- Delete ---

		it('delete action calls deleteDlqEntry with correct params', async () => {
			vi.mocked(deleteDlqEntry).mockResolvedValue(undefined as any);

			const formData = new FormData();
			formData.set('id', 'dlq-1');

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(deleteDlqEntry).toHaveBeenCalledWith('dlq-1', 'tok', 'tid', expect.any(Function));
			expect(result).toEqual({ success: true, action: 'delete' });
		});

		it('delete action returns error when id is missing', async () => {
			const formData = new FormData();

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Missing DLQ entry ID' });
		});

		it('delete action returns ApiError message', async () => {
			vi.mocked(deleteDlqEntry).mockRejectedValue(new ApiError('Not found', 404));

			const formData = new FormData();
			formData.set('id', 'dlq-1');

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Not found' });
		});

		it('delete action returns generic error for non-ApiError', async () => {
			vi.mocked(deleteDlqEntry).mockRejectedValue(new Error('network'));

			const formData = new FormData();
			formData.set('id', 'dlq-1');

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Failed to delete DLQ entry' });
		});
	});
});

// =============================================================================
// DLQ Entry Data Logic
// =============================================================================

describe('DLQ entry data', () => {
	it('entry has all required fields', () => {
		const entry = makeDlqEntry();
		expect(entry.id).toBe('dlq-1');
		expect(entry.subscription_id).toBe('sub-1');
		expect(entry.event_type).toBe('user.created');
		expect(entry.error_message).toBe('Connection refused');
		expect(entry.retry_count).toBe(3);
	});

	it('entry with high retry count', () => {
		const entry = makeDlqEntry({ retry_count: 10 });
		expect(entry.retry_count).toBe(10);
	});

	it('entry with different event types', () => {
		const entry = makeDlqEntry({ event_type: 'user.deleted' });
		expect(entry.event_type).toBe('user.deleted');
	});
});

// =============================================================================
// Svelte Component Module
// =============================================================================

describe('DLQ page Svelte component', () => {
	it('page is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);
});
