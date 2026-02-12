import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/webhooks', () => ({
	listWebhookSubscriptions: vi.fn(),
	listWebhookEventTypes: vi.fn(),
	createWebhookSubscription: vi.fn(),
	getWebhookSubscription: vi.fn(),
	updateWebhookSubscription: vi.fn(),
	deleteWebhookSubscription: vi.fn(),
	listWebhookDeliveries: vi.fn(),
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
import {
	listWebhookSubscriptions,
	listWebhookEventTypes,
	createWebhookSubscription,
	getWebhookSubscription,
	updateWebhookSubscription,
	deleteWebhookSubscription,
	listWebhookDeliveries
} from '$lib/api/webhooks';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeSub = (overrides: Record<string, unknown> = {}) => ({
	id: 'sub-1',
	name: 'Test Webhook',
	url: 'https://example.com/hook',
	description: 'A test webhook',
	event_types: ['user.created', 'user.deleted'],
	enabled: true,
	consecutive_failures: 0,
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	...overrides
});

// =============================================================================
// Webhook List Page (+page.server.ts)
// =============================================================================

describe('Webhook List +page.server', () => {
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
					url: new URL('http://localhost/settings/webhooks'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns subscriptions for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const mockResponse = {
				items: [makeSub()],
				total: 1,
				limit: 20,
				offset: 0
			};
			vi.mocked(listWebhookSubscriptions).mockResolvedValue(mockResponse as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks'),
				fetch: vi.fn()
			} as any);

			expect(result.subscriptions).toEqual([makeSub()]);
			expect(result.total).toBe(1);
			expect(result.limit).toBe(20);
			expect(result.offset).toBe(0);
		});

		it('reads pagination from URL searchParams', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listWebhookSubscriptions).mockResolvedValue({
				items: [],
				total: 0,
				limit: 10,
				offset: 20
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks?limit=10&offset=20'),
				fetch: vi.fn()
			} as any);

			expect(listWebhookSubscriptions).toHaveBeenCalledWith(
				{ limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listWebhookSubscriptions).mockRejectedValue(new Error('Network error'));

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks'),
				fetch: vi.fn()
			} as any);

			expect(result.subscriptions).toEqual([]);
			expect(result.total).toBe(0);
		});
	});
});

// =============================================================================
// Webhook Detail Page (+page.server.ts)
// =============================================================================

describe('Webhook Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./[id]/+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'sub-1' },
					locals: mockLocals(false),
					url: new URL('http://localhost/settings/webhooks/sub-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
			}
		});

		it('returns subscription with deliveries for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getWebhookSubscription).mockResolvedValue(makeSub() as any);
			vi.mocked(listWebhookDeliveries).mockResolvedValue({
				items: [{ id: 'd1', event_type: 'user.created', status: 'delivered' }],
				total: 1,
				limit: 20,
				offset: 0
			} as any);

			const result = await load({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks/sub-1'),
				fetch: vi.fn()
			} as any);

			expect(result.subscription.id).toBe('sub-1');
			expect(result.deliveries).toHaveLength(1);
			expect(result.deliveryTotal).toBe(1);
		});

		it('throws error when subscription not found', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getWebhookSubscription).mockRejectedValue(
				new ApiError('Not found', 404)
			);

			try {
				await load({
					params: { id: 'bad-id' },
					locals: mockLocals(true),
					url: new URL('http://localhost/settings/webhooks/bad-id'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('returns empty deliveries when delivery API fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getWebhookSubscription).mockResolvedValue(makeSub() as any);
			vi.mocked(listWebhookDeliveries).mockRejectedValue(new Error('fail'));

			const result = await load({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/webhooks/sub-1'),
				fetch: vi.fn()
			} as any);

			expect(result.subscription.id).toBe('sub-1');
			expect(result.deliveries).toEqual([]);
			expect(result.deliveryTotal).toBe(0);
		});
	});

	describe('actions', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./[id]/+page.server');
			actions = mod.actions;
		});

		it('pause action calls updateWebhookSubscription with enabled=false', async () => {
			vi.mocked(updateWebhookSubscription).mockResolvedValue(makeSub({ enabled: false }) as any);

			const result = await actions.pause({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(updateWebhookSubscription).toHaveBeenCalledWith(
				'sub-1',
				{ enabled: false },
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'paused' });
		});

		it('resume action calls updateWebhookSubscription with enabled=true', async () => {
			vi.mocked(updateWebhookSubscription).mockResolvedValue(makeSub({ enabled: true }) as any);

			const result = await actions.resume({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(updateWebhookSubscription).toHaveBeenCalledWith(
				'sub-1',
				{ enabled: true },
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'resumed' });
		});

		it('pause action returns fail on ApiError', async () => {
			vi.mocked(updateWebhookSubscription).mockRejectedValue(
				new ApiError('Forbidden', 403)
			);

			const result = await actions.pause({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(403);
		});

		it('delete action redirects on success', async () => {
			vi.mocked(deleteWebhookSubscription).mockResolvedValue(undefined as any);

			try {
				await actions.delete({
					params: { id: 'sub-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/settings/webhooks');
			}
		});

		it('delete action returns fail on ApiError', async () => {
			vi.mocked(deleteWebhookSubscription).mockRejectedValue(
				new ApiError('Not found', 404)
			);

			const result = await actions.delete({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(404);
		});

		it('resume action returns generic error for non-ApiError', async () => {
			vi.mocked(updateWebhookSubscription).mockRejectedValue(new Error('network'));

			const result = await actions.resume({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});
});

// =============================================================================
// Webhook Create Page (+page.server.ts)
// =============================================================================

describe('Webhook Create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./create/+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
			}
		});

		it('returns form and event types for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listWebhookEventTypes).mockResolvedValue({
				event_types: [
					{ event_type: 'user.created', category: 'user', description: 'User created' }
				]
			} as any);

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.eventTypes).toHaveLength(1);
			expect(result.eventTypes[0].event_type).toBe('user.created');
		});

		it('returns empty event types when API fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listWebhookEventTypes).mockRejectedValue(new Error('fail'));

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.eventTypes).toEqual([]);
		});
	});

	describe('actions.default', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./create/+page.server');
			actions = mod.actions;
		});

		it('redirects on successful creation', async () => {
			vi.mocked(createWebhookSubscription).mockResolvedValue({ id: 'new-sub' } as any);

			const formData = new FormData();
			formData.set('name', 'My Hook');
			formData.set('url', 'https://example.com/hook');
			formData.set('event_types', 'user.created,user.deleted');
			formData.set('description', '');
			formData.set('secret', '');

			try {
				await actions.default({
					request: new Request('http://localhost/settings/webhooks/create', {
						method: 'POST',
						body: formData
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toContain('/settings/webhooks/new-sub');
			}
		});

		it('returns fail when form is invalid', async () => {
			const formData = new FormData();
			// missing required fields

			const result = await actions.default({
				request: new Request('http://localhost/settings/webhooks/create', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns message on ApiError', async () => {
			vi.mocked(createWebhookSubscription).mockRejectedValue(
				new ApiError('Duplicate name', 409)
			);

			const formData = new FormData();
			formData.set('name', 'Dup Hook');
			formData.set('url', 'https://example.com/hook');
			formData.set('event_types', 'user.created');
			formData.set('description', '');
			formData.set('secret', '');

			const result = await actions.default({
				request: new Request('http://localhost/settings/webhooks/create', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('Duplicate name');
		});
	});
});

// =============================================================================
// Webhook Edit Page (+page.server.ts)
// =============================================================================

describe('Webhook Edit +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./[id]/edit/+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'sub-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
			}
		});

		it('pre-fills form with subscription data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getWebhookSubscription).mockResolvedValue(makeSub() as any);
			vi.mocked(listWebhookEventTypes).mockResolvedValue({
				event_types: [{ event_type: 'user.created', category: 'user', description: 'test' }]
			} as any);

			const result = await load({
				params: { id: 'sub-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.subscription.id).toBe('sub-1');
			expect(result.form.data.name).toBe('Test Webhook');
			expect(result.form.data.url).toBe('https://example.com/hook');
			expect(result.form.data.event_types).toBe('user.created,user.deleted');
		});

		it('throws error when subscription not found', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getWebhookSubscription).mockRejectedValue(
				new ApiError('Not found', 404)
			);

			try {
				await load({
					params: { id: 'bad-id' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});
	});

	describe('actions.default', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./[id]/edit/+page.server');
			actions = mod.actions;
		});

		it('redirects on successful update', async () => {
			vi.mocked(updateWebhookSubscription).mockResolvedValue(makeSub() as any);

			const formData = new FormData();
			formData.set('name', 'Updated Hook');
			formData.set('url', 'https://example.com/hook2');
			formData.set('event_types', 'user.created');
			formData.set('description', '');
			formData.set('secret', '');

			try {
				await actions.default({
					params: { id: 'sub-1' },
					request: new Request('http://localhost', { method: 'POST', body: formData }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toContain('/settings/webhooks/sub-1');
			}
		});

		it('returns message on ApiError', async () => {
			vi.mocked(updateWebhookSubscription).mockRejectedValue(
				new ApiError('Conflict', 409)
			);

			const formData = new FormData();
			formData.set('name', 'Updated Hook');
			formData.set('url', 'https://example.com/hook2');
			formData.set('event_types', 'user.created');
			formData.set('description', '');
			formData.set('secret', '');

			const result = await actions.default({
				params: { id: 'sub-1' },
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('Conflict');
		});
	});
});

// =============================================================================
// Status Derivation Logic
// =============================================================================

describe('Webhook status derivation', () => {
	it('active: enabled=true, consecutive_failures=0', () => {
		const sub = makeSub({ enabled: true, consecutive_failures: 0 });
		const label = !sub.enabled ? 'Paused' : sub.consecutive_failures > 0 ? 'Failing' : 'Active';
		expect(label).toBe('Active');
	});

	it('paused: enabled=false', () => {
		const sub = makeSub({ enabled: false, consecutive_failures: 0 });
		const label = !sub.enabled ? 'Paused' : sub.consecutive_failures > 0 ? 'Failing' : 'Active';
		expect(label).toBe('Paused');
	});

	it('failing: enabled=true, consecutive_failures>0', () => {
		const sub = makeSub({ enabled: true, consecutive_failures: 3 });
		const label = !sub.enabled ? 'Paused' : sub.consecutive_failures > 0 ? 'Failing' : 'Active';
		expect(label).toBe('Failing');
	});

	it('paused takes priority even with failures', () => {
		const sub = makeSub({ enabled: false, consecutive_failures: 5 });
		const label = !sub.enabled ? 'Paused' : sub.consecutive_failures > 0 ? 'Failing' : 'Active';
		expect(label).toBe('Paused');
	});
});

// =============================================================================
// Svelte Component Modules
// =============================================================================

describe('Webhook page Svelte components', () => {
	it('list page is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
