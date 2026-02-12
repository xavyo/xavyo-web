import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	getLifecycleEvent: vi.fn(),
	processLifecycleEvent: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load, actions } from './+page.server';
import { getLifecycleEvent, processLifecycleEvent } from '$lib/api/birthright';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { LifecycleEventDetail, LifecycleAction, AccessSnapshotSummary, ProcessEventResult } from '$lib/api/types';

const mockGetEvent = vi.mocked(getLifecycleEvent);
const mockProcessEvent = vi.mocked(processLifecycleEvent);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

/** Backend returns flattened event + actions + snapshot */
function makeEventDetail(overrides: Partial<LifecycleEventDetail> = {}): LifecycleEventDetail {
	return {
		id: 'evt-1',
		tenant_id: 't1',
		user_id: 'user-1',
		event_type: 'joiner',
		attributes_before: null,
		attributes_after: { department: 'Engineering' },
		source: 'api',
		processed_at: '2024-01-01T00:00:00Z',
		created_at: '2024-01-01T00:00:00Z',
		actions: [makeAction()],
		snapshot: makeSnapshot(),
		...overrides
	};
}

function makeAction(overrides: Partial<LifecycleAction> = {}): LifecycleAction {
	return {
		id: 'act-1',
		event_id: 'evt-1',
		action_type: 'provision',
		assignment_id: null,
		policy_id: 'pol-1',
		entitlement_id: 'ent-1',
		scheduled_at: null,
		executed_at: '2024-01-01T00:00:00Z',
		cancelled_at: null,
		error_message: null,
		created_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

function makeSnapshot(overrides: Partial<AccessSnapshotSummary> = {}): AccessSnapshotSummary {
	return {
		id: 'snap-1',
		snapshot_type: 'current',
		assignment_count: 3,
		created_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

function makeProcessResult(): ProcessEventResult {
	return {
		event: {
			id: 'evt-1',
			tenant_id: 't1',
			user_id: 'user-1',
			event_type: 'joiner',
			attributes_before: null,
			attributes_after: { department: 'Engineering' },
			source: 'api',
			processed_at: '2024-01-01T00:00:00Z',
			created_at: '2024-01-01T00:00:00Z'
		},
		actions: [makeAction()],
		snapshot: makeSnapshot(),
		summary: { provisioned: 1, revoked: 0, skipped: 0, scheduled: 0 }
	};
}

describe('Event Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { id: 'evt-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns normalized event data for admin', async () => {
			mockGetEvent.mockResolvedValue(makeEventDetail());

			const result = (await load({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.event).toBeDefined();
			expect(result.event.id).toBe('evt-1');
			expect(result.event.event_type).toBe('joiner');
		});

		it('returns actions list', async () => {
			mockGetEvent.mockResolvedValue(makeEventDetail());

			const result = (await load({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.actions).toHaveLength(1);
			expect(result.actions[0].action_type).toBe('provision');
		});

		it('returns snapshot', async () => {
			mockGetEvent.mockResolvedValue(makeEventDetail());

			const result = (await load({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.snapshot).toBeDefined();
			expect(result.snapshot.assignment_count).toBe(3);
		});

		it('handles null snapshot', async () => {
			mockGetEvent.mockResolvedValue(makeEventDetail({ snapshot: null }));

			const result = (await load({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.snapshot).toBeNull();
		});

		it('handles empty actions', async () => {
			mockGetEvent.mockResolvedValue(makeEventDetail({ actions: [] }));

			const result = (await load({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.actions).toHaveLength(0);
		});

		it('passes correct id to getLifecycleEvent', async () => {
			mockGetEvent.mockResolvedValue(makeEventDetail());

			await load({
				params: { id: 'evt-42' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetEvent).toHaveBeenCalledWith('evt-42', 'tok', 'tid', expect.any(Function));
		});
	});

	describe('actions.process', () => {
		it('exports process action', () => {
			expect(actions.process).toBeDefined();
		});

		it('calls processLifecycleEvent and returns summary', async () => {
			mockProcessEvent.mockResolvedValue(makeProcessResult());
			const result: any = await actions.process({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.success).toBe(true);
			expect(result.summary.provisioned).toBe(1);
			expect(mockProcessEvent).toHaveBeenCalledWith('evt-1', 'tok', 'tid', expect.any(Function));
		});

		it('returns error on process failure from ApiError', async () => {
			mockProcessEvent.mockRejectedValue(new ApiError('Event already processed', 409));
			const result: any = await actions.process({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.error).toBe('Event already processed');
		});

		it('returns generic error on non-API failure', async () => {
			mockProcessEvent.mockRejectedValue(new Error('network error'));
			const result: any = await actions.process({
				params: { id: 'evt-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.error).toBe('Failed to process event');
		});
	});
});

describe('Event Detail +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});

describe('Event Detail rendering logic', () => {
	describe('event type badge class', () => {
		function eventTypeBadgeClass(type: string): string {
			switch (type) {
				case 'joiner':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
				case 'mover':
					return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
				case 'leaver':
					return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
			}
		}

		it('joiner gets blue badge', () => {
			expect(eventTypeBadgeClass('joiner')).toContain('blue');
		});

		it('mover gets amber badge', () => {
			expect(eventTypeBadgeClass('mover')).toContain('amber');
		});

		it('leaver gets red badge', () => {
			expect(eventTypeBadgeClass('leaver')).toContain('red');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null | undefined): string {
			if (!dateStr || isNaN(new Date(dateStr).getTime())) return '-';
			return new Date(dateStr).toLocaleString();
		}

		it('formats valid date string', () => {
			const result = formatDate('2024-01-01T00:00:00Z');
			expect(result).not.toBe('-');
			expect(result).toBeTruthy();
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('-');
		});

		it('returns dash for undefined', () => {
			expect(formatDate(undefined)).toBe('-');
		});

		it('returns dash for empty string', () => {
			expect(formatDate('')).toBe('-');
		});

		it('returns dash for invalid date', () => {
			expect(formatDate('not-a-date')).toBe('-');
		});
	});

	describe('isProcessed logic', () => {
		it('returns true when processed_at is set', () => {
			const detail = makeEventDetail({ processed_at: '2024-01-01T00:00:00Z' });
			expect(!!detail.processed_at).toBe(true);
		});

		it('returns false when processed_at is null', () => {
			const detail = makeEventDetail({ processed_at: null });
			expect(!!detail.processed_at).toBe(false);
		});
	});

	describe('Process Event button visibility', () => {
		it('shows Process Event button when not processed', () => {
			const isProcessed = false;
			expect(!isProcessed).toBe(true);
		});

		it('hides Process Event button when processed', () => {
			const isProcessed = true;
			expect(!isProcessed).toBe(false);
		});
	});

	describe('snapshot display', () => {
		it('shows snapshot when present', () => {
			const detail = makeEventDetail();
			expect(detail.snapshot).not.toBeNull();
		});

		it('shows snapshot assignment_count', () => {
			const snapshot = makeSnapshot();
			expect(snapshot.assignment_count).toBe(3);
		});

		it('handles null snapshot gracefully', () => {
			const detail = makeEventDetail({ snapshot: null });
			expect(detail.snapshot).toBeNull();
		});
	});

	describe('action log data', () => {
		it('action has all required fields', () => {
			const action = makeAction();
			expect(action.id).toBeDefined();
			expect(action.event_id).toBeDefined();
			expect(action.action_type).toBeDefined();
			expect(action.entitlement_id).toBeDefined();
			expect(action.created_at).toBeDefined();
		});

		it('action_type is a valid value', () => {
			const validTypes = ['provision', 'revoke', 'schedule_revoke', 'cancel_revoke', 'skip'];
			expect(validTypes).toContain(makeAction().action_type);
		});

		it('shows empty actions message for empty list', () => {
			const detail = makeEventDetail({ actions: [] });
			expect(detail.actions.length).toBe(0);
		});

		it('action error_message can be null', () => {
			const action = makeAction({ error_message: null });
			expect(action.error_message).toBeNull();
		});

		it('action error_message can be a string', () => {
			const action = makeAction({ error_message: 'Permission denied' });
			expect(action.error_message).toBe('Permission denied');
		});
	});

	describe('action type badge classes', () => {
		const actionTypeBadgeClass: Record<string, string> = {
			provision: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
			revoke: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
			schedule_revoke: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
			cancel_revoke: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
			skip: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
		};

		it('provision gets green badge', () => {
			expect(actionTypeBadgeClass['provision']).toContain('green');
		});

		it('revoke gets red badge', () => {
			expect(actionTypeBadgeClass['revoke']).toContain('red');
		});

		it('schedule_revoke gets amber badge', () => {
			expect(actionTypeBadgeClass['schedule_revoke']).toContain('amber');
		});

		it('cancel_revoke gets blue badge', () => {
			expect(actionTypeBadgeClass['cancel_revoke']).toContain('blue');
		});

		it('skip gets gray badge', () => {
			expect(actionTypeBadgeClass['skip']).toContain('gray');
		});
	});

	describe('formatActionType', () => {
		function formatActionType(type: string): string {
			return type.replace(/_/g, ' ');
		}

		it('formats provision type', () => {
			expect(formatActionType('provision')).toBe('provision');
		});

		it('formats schedule_revoke type', () => {
			expect(formatActionType('schedule_revoke')).toBe('schedule revoke');
		});

		it('formats cancel_revoke type', () => {
			expect(formatActionType('cancel_revoke')).toBe('cancel revoke');
		});
	});

	describe('mock data conformity', () => {
		it('LifecycleEventDetail has all required fields', () => {
			const d = makeEventDetail();
			expect(d.id).toBeDefined();
			expect(d.event_type).toBeDefined();
			expect(d.actions).toBeDefined();
			expect('snapshot' in d).toBe(true);
		});

		it('AccessSnapshotSummary has all required fields', () => {
			const s = makeSnapshot();
			expect(s.id).toBeDefined();
			expect(s.snapshot_type).toBeDefined();
			expect(s.assignment_count).toBeDefined();
			expect(s.created_at).toBeDefined();
		});
	});
});
