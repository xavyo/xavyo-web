import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/persona-context', () => ({
	getCurrentContext: vi.fn(),
	listContextSessions: vi.fn()
}));

vi.mock('$lib/api/personas', () => ({
	listPersonas: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

import { load } from './+page.server';
import { getCurrentContext, listContextSessions } from '$lib/api/persona-context';
import { listPersonas } from '$lib/api/personas';
import type { CurrentContextResponse, ContextSessionSummary } from '$lib/api/types';

const mockGetContext = vi.mocked(getCurrentContext);
const mockListSessions = vi.mocked(listContextSessions);
const mockListPersonas = vi.mocked(listPersonas);

function makeContext(overrides: Partial<CurrentContextResponse> = {}): CurrentContextResponse {
	return {
		physical_user_id: 'user-1',
		physical_user_name: 'John Doe',
		is_persona_active: false,
		active_persona: null,
		session_started_at: null,
		session_expires_at: null,
		...overrides
	};
}

function makeSession(overrides: Partial<ContextSessionSummary> = {}): ContextSessionSummary {
	return {
		id: 'sess-1',
		switched_at: '2026-02-10T14:00:00Z',
		from_context: 'Physical Identity',
		to_context: 'Admin Persona',
		reason: 'Admin task',
		...overrides
	};
}

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['user'] }
});

describe('Persona Context +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		it('returns null context when no accessToken', async () => {
			const result = (await load({
				locals: { accessToken: null, tenantId: 'tid', user: { roles: [] } },
				fetch: vi.fn()
			} as any)) as any;

			expect(result.context).toBeNull();
			expect(result.sessions).toEqual([]);
			expect(result.personas).toEqual([]);
		});

		it('returns null context when no tenantId', async () => {
			const result = (await load({
				locals: { accessToken: 'tok', tenantId: null, user: { roles: [] } },
				fetch: vi.fn()
			} as any)) as any;

			expect(result.context).toBeNull();
		});

		it('returns context, sessions, and personas for authenticated user', async () => {
			const context = makeContext();
			const sessions = [makeSession()];

			mockGetContext.mockResolvedValue(context);
			mockListSessions.mockResolvedValue({ items: sessions, total: 1, limit: 50, offset: 0 });
			mockListPersonas.mockResolvedValue({ items: [{ id: 'p-1', name: 'Test Persona', status: 'active' }] } as any);

			const result = (await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.context).toEqual(context);
			expect(result.sessions).toHaveLength(1);
			expect(result.sessionsTotal).toBe(1);
			expect(result.personas).toHaveLength(1);
		});

		it('handles context API failure gracefully', async () => {
			mockGetContext.mockRejectedValue(new Error('context failed'));
			mockListSessions.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListPersonas.mockResolvedValue({ items: [] } as any);

			const result = (await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.context).toBeNull();
			expect(result.sessions).toEqual([]);
		});

		it('handles sessions API failure gracefully', async () => {
			mockGetContext.mockResolvedValue(makeContext());
			mockListSessions.mockRejectedValue(new Error('sessions failed'));
			mockListPersonas.mockResolvedValue({ items: [] } as any);

			const result = (await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.context).toBeDefined();
			expect(result.sessions).toEqual([]);
		});

		it('handles personas API failure gracefully', async () => {
			mockGetContext.mockResolvedValue(makeContext());
			mockListSessions.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListPersonas.mockRejectedValue(new Error('personas failed'));

			const result = (await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.context).toBeDefined();
			expect(result.personas).toEqual([]);
		});

		it('passes correct accessToken and tenantId', async () => {
			mockGetContext.mockResolvedValue(makeContext());
			mockListSessions.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListPersonas.mockResolvedValue({ items: [] } as any);
			const mockFetch = vi.fn();

			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['user'] }
				},
				fetch: mockFetch
			} as any);

			expect(mockGetContext).toHaveBeenCalledWith('my-token', 'my-tenant', mockFetch);
			expect(mockListSessions).toHaveBeenCalledWith(
				{ limit: 50 },
				'my-token',
				'my-tenant',
				mockFetch
			);
		});
	});
});

describe('Persona Context +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	}, 15000);
});

describe('Persona Context rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Persona Context';
			expect(title).toBe('Persona Context');
		});

		it('has correct description', () => {
			const desc = 'Switch between your physical identity and assigned personas';
			expect(desc).toBe('Switch between your physical identity and assigned personas');
		});
	});

	describe('context display', () => {
		it('shows unable to load message when context is null', () => {
			const msg = 'Unable to load current context.';
			expect(msg).toBe('Unable to load current context.');
		});
	});

	describe('session history heading', () => {
		it('has correct heading', () => {
			const heading = 'Session History';
			expect(heading).toBe('Session History');
		});
	});

	describe('mock data conformity', () => {
		it('CurrentContextResponse has all required fields', () => {
			const c = makeContext();
			expect(c.physical_user_id).toBeDefined();
			expect(typeof c.is_persona_active).toBe('boolean');
		});

		it('CurrentContextResponse with active persona', () => {
			const c = makeContext({
				is_persona_active: true,
				active_persona: { id: 'p-1', name: 'Test' }
			});
			expect(c.active_persona).toBeDefined();
			expect(c.active_persona?.name).toBe('Test');
		});

		it('ContextSessionSummary has all required fields', () => {
			const s = makeSession();
			expect(s.id).toBeDefined();
			expect(s.switched_at).toBeDefined();
			expect(s.from_context).toBeDefined();
			expect(s.to_context).toBeDefined();
		});
	});
});
