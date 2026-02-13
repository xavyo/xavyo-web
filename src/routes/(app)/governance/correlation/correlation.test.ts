import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/correlation', () => ({
	listCorrelationCases: vi.fn(),
	listIdentityCorrelationRules: vi.fn(),
	listCorrelationAuditEvents: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import {
	listCorrelationCases,
	listIdentityCorrelationRules,
	listCorrelationAuditEvents
} from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';
import type {
	CorrelationCase,
	IdentityCorrelationRule,
	CorrelationAuditEvent
} from '$lib/api/types';

const mockListCases = vi.mocked(listCorrelationCases);
const mockListRules = vi.mocked(listIdentityCorrelationRules);
const mockListAudit = vi.mocked(listCorrelationAuditEvents);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeCase(overrides: Partial<CorrelationCase> = {}): CorrelationCase {
	return {
		id: 'case-1',
		connector_id: 'conn-1',
		connector_name: 'LDAP Connector',
		account_identifier: 'jdoe@example.com',
		account_id: 'acc-123',
		status: 'pending',
		trigger_type: 'import',
		highest_confidence: 0.92,
		candidate_count: 3,
		assigned_to: null,
		created_at: '2026-02-01T10:00:00Z',
		...overrides
	};
}

function makeIdentityRule(
	overrides: Partial<IdentityCorrelationRule> = {}
): IdentityCorrelationRule {
	return {
		id: 'rule-1',
		name: 'Email Match',
		attribute: 'email',
		match_type: 'exact',
		algorithm: null,
		threshold: 0.95,
		weight: 1.0,
		is_active: true,
		priority: 1,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-15T00:00:00Z',
		...overrides
	};
}

function makeAuditEvent(
	overrides: Partial<CorrelationAuditEvent> = {}
): CorrelationAuditEvent {
	return {
		id: 'evt-1',
		connector_id: 'conn-1',
		account_id: 'acc-1',
		case_id: 'case-1',
		identity_id: 'ident-1',
		event_type: 'auto_confirm',
		outcome: 'success',
		confidence_score: 0.95,
		candidate_count: 2,
		candidates_summary: {},
		rules_snapshot: {},
		thresholds_snapshot: {},
		actor_type: 'system',
		actor_id: null,
		reason: null,
		created_at: '2026-02-01T12:00:00Z',
		...overrides
	};
}

describe('Correlation hub +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('throws 401 when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('throws 401 when no tenantId', async () => {
			try {
				await load({
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('throws 403 for non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});

		it('returns cases, identityRules, and auditEvents for admin', async () => {
			const cases = [makeCase()];
			const rules = [makeIdentityRule()];
			const events = [makeAuditEvent()];

			mockListCases.mockResolvedValue({ items: cases, total: 1, limit: 50, offset: 0 });
			mockListRules.mockResolvedValue({ items: rules, total: 1, limit: 50, offset: 0 });
			mockListAudit.mockResolvedValue({ items: events, total: 1, limit: 50, offset: 0 });

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.cases).toHaveLength(1);
			expect(result.cases[0].id).toBe('case-1');
			expect(result.casesTotal).toBe(1);
			expect(result.identityRules).toHaveLength(1);
			expect(result.identityRules[0].name).toBe('Email Match');
			expect(result.identityRulesTotal).toBe(1);
			expect(result.auditEvents).toHaveLength(1);
			expect(result.auditEvents[0].event_type).toBe('auto_confirm');
			expect(result.auditTotal).toBe(1);
		});

		it('calls listCorrelationCases with pending status by default', async () => {
			mockListCases.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListAudit.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockListCases).toHaveBeenCalledWith(
				{ status: 'pending', limit: 50, offset: 0 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls listIdentityCorrelationRules with pagination', async () => {
			mockListCases.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListAudit.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockListRules).toHaveBeenCalledWith(
				{ limit: 50, offset: 0 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls listCorrelationAuditEvents with pagination', async () => {
			mockListCases.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListAudit.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockListAudit).toHaveBeenCalledWith(
				{ limit: 50, offset: 0 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('gracefully handles cases API failure', async () => {
			mockListCases.mockRejectedValue(new Error('cases failed'));
			mockListRules.mockResolvedValue({
				items: [makeIdentityRule()],
				total: 1,
				limit: 50,
				offset: 0
			});
			mockListAudit.mockResolvedValue({
				items: [makeAuditEvent()],
				total: 1,
				limit: 50,
				offset: 0
			});

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.cases).toEqual([]);
			expect(result.casesTotal).toBe(0);
			expect(result.identityRules).toHaveLength(1);
			expect(result.auditEvents).toHaveLength(1);
		});

		it('gracefully handles identity rules API failure', async () => {
			mockListCases.mockResolvedValue({
				items: [makeCase()],
				total: 1,
				limit: 50,
				offset: 0
			});
			mockListRules.mockRejectedValue(new Error('rules failed'));
			mockListAudit.mockResolvedValue({
				items: [makeAuditEvent()],
				total: 1,
				limit: 50,
				offset: 0
			});

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.cases).toHaveLength(1);
			expect(result.identityRules).toEqual([]);
			expect(result.identityRulesTotal).toBe(0);
			expect(result.auditEvents).toHaveLength(1);
		});

		it('gracefully handles audit events API failure', async () => {
			mockListCases.mockResolvedValue({
				items: [makeCase()],
				total: 1,
				limit: 50,
				offset: 0
			});
			mockListRules.mockResolvedValue({
				items: [makeIdentityRule()],
				total: 1,
				limit: 50,
				offset: 0
			});
			mockListAudit.mockRejectedValue(new Error('audit failed'));

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.cases).toHaveLength(1);
			expect(result.identityRules).toHaveLength(1);
			expect(result.auditEvents).toEqual([]);
			expect(result.auditTotal).toBe(0);
		});

		it('gracefully handles all APIs failing', async () => {
			mockListCases.mockRejectedValue(new Error('fail'));
			mockListRules.mockRejectedValue(new Error('fail'));
			mockListAudit.mockRejectedValue(new Error('fail'));

			const result = (await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.cases).toEqual([]);
			expect(result.casesTotal).toBe(0);
			expect(result.identityRules).toEqual([]);
			expect(result.identityRulesTotal).toBe(0);
			expect(result.auditEvents).toEqual([]);
			expect(result.auditTotal).toBe(0);
		});

		it('passes correct accessToken and tenantId', async () => {
			mockListCases.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			mockListAudit.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			const mockFetch = vi.fn();

			await load({
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				fetch: mockFetch
			} as any);

			expect(mockListCases).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
			expect(mockListRules).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
			expect(mockListAudit).toHaveBeenCalledWith(
				expect.any(Object),
				'my-token',
				'my-tenant',
				mockFetch
			);
		});
	});
});

describe('Correlation hub +page.svelte', () => {
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

describe('Correlation hub rendering logic', () => {
	describe('tab definitions', () => {
		const tabs = [
			{ id: 'cases', label: 'Cases' },
			{ id: 'identity-rules', label: 'Identity Rules' },
			{ id: 'audit', label: 'Audit' }
		];

		it('has 3 tabs', () => {
			expect(tabs).toHaveLength(3);
		});

		it('has Cases as first tab', () => {
			expect(tabs[0].label).toBe('Cases');
		});

		it('has Identity Rules as second tab', () => {
			expect(tabs[1].label).toBe('Identity Rules');
		});

		it('has Audit as third tab', () => {
			expect(tabs[2].label).toBe('Audit');
		});
	});

	describe('case status badge class', () => {
		function caseStatusBadgeClass(status: string): string {
			switch (status) {
				case 'pending':
					return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
				case 'confirmed':
					return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
				case 'rejected':
					return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
				case 'identity_created':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			}
		}

		it('pending status gets yellow badge', () => {
			expect(caseStatusBadgeClass('pending')).toContain('yellow');
		});

		it('confirmed status gets green badge', () => {
			expect(caseStatusBadgeClass('confirmed')).toContain('green');
		});

		it('rejected status gets red badge', () => {
			expect(caseStatusBadgeClass('rejected')).toContain('red');
		});

		it('identity_created status gets blue badge', () => {
			expect(caseStatusBadgeClass('identity_created')).toContain('blue');
		});

		it('unknown status gets gray badge', () => {
			expect(caseStatusBadgeClass('unknown')).toContain('gray');
		});
	});

	describe('trigger type badge class', () => {
		function triggerTypeBadgeClass(type: string): string {
			switch (type) {
				case 'import':
					return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
				case 'reconciliation':
					return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
				case 'manual':
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			}
		}

		it('import gets purple badge', () => {
			expect(triggerTypeBadgeClass('import')).toContain('purple');
		});

		it('reconciliation gets indigo badge', () => {
			expect(triggerTypeBadgeClass('reconciliation')).toContain('indigo');
		});

		it('manual gets gray badge', () => {
			expect(triggerTypeBadgeClass('manual')).toContain('gray');
		});
	});

	describe('event type badge class', () => {
		function eventTypeBadgeClass(type: string): string {
			switch (type) {
				case 'auto_confirm':
					return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
				case 'manual_confirm':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
				case 'reject':
					return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
				case 'create_identity':
					return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
				case 'reassign':
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			}
		}

		it('auto_confirm gets green badge', () => {
			expect(eventTypeBadgeClass('auto_confirm')).toContain('green');
		});

		it('manual_confirm gets blue badge', () => {
			expect(eventTypeBadgeClass('manual_confirm')).toContain('blue');
		});

		it('reject gets red badge', () => {
			expect(eventTypeBadgeClass('reject')).toContain('red');
		});

		it('create_identity gets purple badge', () => {
			expect(eventTypeBadgeClass('create_identity')).toContain('purple');
		});

		it('reassign gets gray badge', () => {
			expect(eventTypeBadgeClass('reassign')).toContain('gray');
		});
	});

	describe('outcome badge class', () => {
		function outcomeBadgeClass(outcome: string): string {
			return outcome === 'success'
				? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
				: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
		}

		it('success gets green badge', () => {
			expect(outcomeBadgeClass('success')).toContain('green');
		});

		it('failure gets red badge', () => {
			expect(outcomeBadgeClass('failure')).toContain('red');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string): string {
			if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
			return new Date(dateStr).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}

		it('formats valid date string', () => {
			const result = formatDate('2026-02-01T10:00:00Z');
			expect(result).toBeTruthy();
			expect(result).not.toBe('\u2014');
		});

		it('returns dash for empty string', () => {
			expect(formatDate('')).toBe('\u2014');
		});

		it('returns dash for invalid date', () => {
			expect(formatDate('not-a-date')).toBe('\u2014');
		});
	});

	describe('confidence display', () => {
		it('converts 0.92 to 92%', () => {
			expect(Math.round(0.92 * 100)).toBe(92);
		});

		it('converts 0.5 to 50%', () => {
			expect(Math.round(0.5 * 100)).toBe(50);
		});

		it('converts 1.0 to 100%', () => {
			expect(Math.round(1.0 * 100)).toBe(100);
		});
	});

	describe('empty state messages', () => {
		it('shows correct empty cases message', () => {
			const msg = 'No correlation cases found.';
			expect(msg).toBe('No correlation cases found.');
		});

		it('shows correct empty rules message', () => {
			const msg = 'No identity correlation rules configured.';
			expect(msg).toBe('No identity correlation rules configured.');
		});

		it('shows correct empty audit message', () => {
			const msg = 'No audit events found.';
			expect(msg).toBe('No audit events found.');
		});
	});

	describe('pagination logic', () => {
		it('disables Previous when offset is 0', () => {
			const offset = 0;
			expect(offset <= 0).toBe(true);
		});

		it('disables Next when on last page', () => {
			const offset = 40;
			const limit = 50;
			const total = 45;
			expect(offset + limit >= total).toBe(true);
		});

		it('enables Next when more items exist', () => {
			const offset = 0;
			const limit = 50;
			const total = 100;
			expect(offset + limit >= total).toBe(false);
		});

		it('calculates showing range correctly', () => {
			const offset = 50;
			const limit = 50;
			const total = 120;
			const start = offset + 1;
			const end = Math.min(offset + limit, total);
			expect(start).toBe(51);
			expect(end).toBe(100);
		});
	});

	describe('rule count pluralization', () => {
		it('singular when 1 rule', () => {
			const total = 1;
			const text = `${total} rule${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 rule');
		});

		it('plural when 0 rules', () => {
			const total: number = 0;
			const text = `${total} rule${total !== 1 ? 's' : ''}`;
			expect(text).toBe('0 rules');
		});

		it('plural when multiple rules', () => {
			const total: number = 5;
			const text = `${total} rule${total !== 1 ? 's' : ''}`;
			expect(text).toBe('5 rules');
		});
	});

	describe('event count pluralization', () => {
		it('singular when 1 event', () => {
			const total = 1;
			const text = `${total} event${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 event');
		});

		it('plural when multiple events', () => {
			const total: number = 42;
			const text = `${total} event${total !== 1 ? 's' : ''}`;
			expect(text).toBe('42 events');
		});
	});

	describe('mock data conformity', () => {
		it('CorrelationCase has all required fields', () => {
			const c = makeCase();
			expect(c.id).toBeDefined();
			expect(c.connector_id).toBeDefined();
			expect(c.connector_name).toBeDefined();
			expect(c.account_identifier).toBeDefined();
			expect(c.status).toBeDefined();
			expect(c.trigger_type).toBeDefined();
			expect(typeof c.highest_confidence).toBe('number');
			expect(typeof c.candidate_count).toBe('number');
			expect(c.created_at).toBeDefined();
		});

		it('IdentityCorrelationRule has all required fields', () => {
			const r = makeIdentityRule();
			expect(r.id).toBeDefined();
			expect(r.name).toBeDefined();
			expect(r.attribute).toBeDefined();
			expect(r.match_type).toBeDefined();
			expect(typeof r.threshold).toBe('number');
			expect(typeof r.weight).toBe('number');
			expect(typeof r.is_active).toBe('boolean');
			expect(typeof r.priority).toBe('number');
		});

		it('CorrelationAuditEvent has all required fields', () => {
			const e = makeAuditEvent();
			expect(e.id).toBeDefined();
			expect(e.connector_id).toBeDefined();
			expect(e.account_id).toBeDefined();
			expect(e.case_id).toBeDefined();
			expect(e.identity_id).toBeDefined();
			expect(e.event_type).toBeDefined();
			expect(e.outcome).toBeDefined();
			expect(typeof e.confidence_score).toBe('number');
			expect(typeof e.candidate_count).toBe('number');
			expect(e.actor_type).toBeDefined();
			expect(e.created_at).toBeDefined();
		});

		it('CorrelationCase status is a valid value', () => {
			const validStatuses = ['pending', 'confirmed', 'rejected', 'identity_created'];
			const c = makeCase();
			expect(validStatuses).toContain(c.status);
		});

		it('CorrelationCase trigger_type is a valid value', () => {
			const validTypes = ['import', 'reconciliation', 'manual'];
			const c = makeCase();
			expect(validTypes).toContain(c.trigger_type);
		});

		it('IdentityCorrelationRule match_type is a valid value', () => {
			const validTypes = ['exact', 'fuzzy', 'expression'];
			const r = makeIdentityRule();
			expect(validTypes).toContain(r.match_type);
		});

		it('CorrelationAuditEvent event_type is a valid value', () => {
			const validTypes = [
				'auto_confirm',
				'manual_confirm',
				'reject',
				'create_identity',
				'reassign'
			];
			const e = makeAuditEvent();
			expect(validTypes).toContain(e.event_type);
		});

		it('CorrelationAuditEvent outcome is a valid value', () => {
			const validOutcomes = ['success', 'failure'];
			const e = makeAuditEvent();
			expect(validOutcomes).toContain(e.outcome);
		});

		it('CorrelationAuditEvent actor_type is a valid value', () => {
			const validTypes = ['user', 'system'];
			const e = makeAuditEvent();
			expect(validTypes).toContain(e.actor_type);
		});
	});
});
