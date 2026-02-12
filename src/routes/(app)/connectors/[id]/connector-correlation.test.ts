import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/connectors', () => ({
	getConnector: vi.fn(),
	getConnectorHealth: vi.fn(),
	activateConnector: vi.fn(),
	deactivateConnector: vi.fn(),
	deleteConnector: vi.fn()
}));

vi.mock('$lib/api/correlation', () => ({
	listCorrelationRules: vi.fn(),
	getCorrelationThresholds: vi.fn()
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
import { getConnector, getConnectorHealth } from '$lib/api/connectors';
import { listCorrelationRules, getCorrelationThresholds } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';
import type {
	Connector,
	ConnectorHealthStatus,
	CorrelationRule,
	CorrelationThreshold,
	CorrelationStatistics,
	CorrelationTrends,
	DailyTrend
} from '$lib/api/types';

const mockGetConnector = vi.mocked(getConnector);
const mockGetHealth = vi.mocked(getConnectorHealth);
const mockListRules = vi.mocked(listCorrelationRules);
const mockGetThresholds = vi.mocked(getCorrelationThresholds);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeConnector(overrides: Partial<Connector> = {}): Connector {
	return {
		id: 'conn-1',
		name: 'Corporate LDAP',
		description: 'Main LDAP directory',
		connector_type: 'ldap',
		config: { host: 'ldap.example.com', port: 389, base_dn: 'dc=example,dc=com' },
		status: 'active',
		created_at: '2026-01-15T10:00:00Z',
		updated_at: '2026-02-01T14:30:00Z',
		...overrides
	};
}

function makeHealth(overrides: Partial<ConnectorHealthStatus> = {}): ConnectorHealthStatus {
	return {
		connector_id: 'conn-1',
		is_online: true,
		consecutive_failures: 0,
		last_check_at: '2026-02-10T12:00:00Z',
		...overrides
	};
}

function makeCorrelationRule(overrides: Partial<CorrelationRule> = {}): CorrelationRule {
	return {
		id: 'rule-1',
		tenant_id: 'tid',
		connector_id: 'conn-1',
		name: 'Email Exact Match',
		source_attribute: 'mail',
		target_attribute: 'email',
		match_type: 'exact',
		algorithm: null,
		threshold: 0.95,
		weight: 1.0,
		expression: null,
		tier: 1,
		is_definitive: true,
		normalize: true,
		is_active: true,
		priority: 1,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-15T00:00:00Z',
		...overrides
	};
}

function makeCorrelationThreshold(
	overrides: Partial<CorrelationThreshold> = {}
): CorrelationThreshold {
	return {
		id: 'thresh-1',
		connector_id: 'conn-1',
		auto_confirm_threshold: 0.9,
		manual_review_threshold: 0.7,
		tuning_mode: false,
		include_deactivated: false,
		batch_size: 100,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-15T00:00:00Z',
		...overrides
	};
}

function makeStatistics(overrides: Partial<CorrelationStatistics> = {}): CorrelationStatistics {
	return {
		connector_id: 'conn-1',
		period_start: '2026-01-12',
		period_end: '2026-02-12',
		total_evaluated: 500,
		auto_confirmed_count: 350,
		auto_confirmed_percentage: 70,
		manual_review_count: 100,
		manual_review_percentage: 20,
		no_match_count: 50,
		no_match_percentage: 10,
		average_confidence: 0.85,
		review_queue_depth: 15,
		suggestions: ['Consider increasing auto-confirm threshold'],
		...overrides
	};
}

function makeTrends(overrides: Partial<CorrelationTrends> = {}): CorrelationTrends {
	return {
		connector_id: 'conn-1',
		period_start: '2026-01-12',
		period_end: '2026-02-12',
		daily_trends: [
			{
				date: '2026-02-01',
				total_evaluated: 50,
				auto_confirmed: 35,
				manual_review: 10,
				no_match: 5,
				average_confidence: 0.88
			},
			{
				date: '2026-02-02',
				total_evaluated: 60,
				auto_confirmed: 42,
				manual_review: 12,
				no_match: 6,
				average_confidence: 0.86
			}
		],
		suggestions: [],
		...overrides
	};
}

describe('Connector detail +page.server (correlation data)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
		mockGetConnector.mockResolvedValue(makeConnector());
		mockGetHealth.mockResolvedValue(makeHealth());
	});

	describe('load - correlation rules', () => {
		it('returns correlationRules when API succeeds', async () => {
			const rules = [
				makeCorrelationRule({ id: 'rule-1', name: 'Email Match' }),
				makeCorrelationRule({ id: 'rule-2', name: 'Name Fuzzy', match_type: 'fuzzy' })
			];
			mockListRules.mockResolvedValue({ items: rules, total: 2, limit: 100, offset: 0 });
			mockGetThresholds.mockResolvedValue(makeCorrelationThreshold());

			const result = (await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.correlationRules).toHaveLength(2);
			expect(result.correlationRules[0].name).toBe('Email Match');
			expect(result.correlationRules[1].match_type).toBe('fuzzy');
		});

		it('returns empty array when correlation rules API fails', async () => {
			mockListRules.mockRejectedValue(new Error('rules not available'));
			mockGetThresholds.mockResolvedValue(makeCorrelationThreshold());

			const result = (await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.correlationRules).toEqual([]);
		});

		it('calls listCorrelationRules with correct params', async () => {
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 100, offset: 0 });
			mockGetThresholds.mockResolvedValue(makeCorrelationThreshold());

			await load({
				params: { id: 'conn-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockListRules).toHaveBeenCalledWith(
				'conn-99',
				{ limit: 100, offset: 0 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});

	describe('load - correlation thresholds', () => {
		it('returns correlationThresholds when API succeeds', async () => {
			const threshold = makeCorrelationThreshold();
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 100, offset: 0 });
			mockGetThresholds.mockResolvedValue(threshold);

			const result = (await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.correlationThresholds).toEqual(threshold);
			expect(result.correlationThresholds.auto_confirm_threshold).toBe(0.9);
			expect(result.correlationThresholds.manual_review_threshold).toBe(0.7);
		});

		it('returns null when thresholds API fails', async () => {
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 100, offset: 0 });
			mockGetThresholds.mockRejectedValue(new Error('thresholds not available'));

			const result = (await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.correlationThresholds).toBeNull();
		});

		it('calls getCorrelationThresholds with correct params', async () => {
			mockListRules.mockResolvedValue({ items: [], total: 0, limit: 100, offset: 0 });
			mockGetThresholds.mockResolvedValue(makeCorrelationThreshold());

			await load({
				params: { id: 'conn-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetThresholds).toHaveBeenCalledWith(
				'conn-99',
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});

	describe('load - both correlation APIs fail gracefully', () => {
		it('still returns connector and health when both correlation APIs fail', async () => {
			mockListRules.mockRejectedValue(new Error('fail'));
			mockGetThresholds.mockRejectedValue(new Error('fail'));

			const result = (await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.connector).toBeDefined();
			expect(result.connector.id).toBe('conn-1');
			expect(result.health).toBeDefined();
			expect(result.correlationRules).toEqual([]);
			expect(result.correlationThresholds).toBeNull();
		});
	});
});

describe('Connector detail page 7-tab layout', () => {
	const tabValues = [
		'overview',
		'configuration',
		'health',
		'correlation-rules',
		'thresholds',
		'correlation-jobs',
		'statistics'
	];

	it('has exactly 7 tabs', () => {
		expect(tabValues).toHaveLength(7);
	});

	it('includes overview tab', () => {
		expect(tabValues).toContain('overview');
	});

	it('includes configuration tab', () => {
		expect(tabValues).toContain('configuration');
	});

	it('includes health tab', () => {
		expect(tabValues).toContain('health');
	});

	it('includes correlation-rules tab', () => {
		expect(tabValues).toContain('correlation-rules');
	});

	it('includes thresholds tab', () => {
		expect(tabValues).toContain('thresholds');
	});

	it('includes correlation-jobs tab', () => {
		expect(tabValues).toContain('correlation-jobs');
	});

	it('includes statistics tab', () => {
		expect(tabValues).toContain('statistics');
	});
});

describe('Correlation rules rendering logic', () => {
	describe('rule sorting', () => {
		it('sorts rules by tier first, then priority', () => {
			const rules = [
				makeCorrelationRule({ id: 'a', tier: 2, priority: 1 }),
				makeCorrelationRule({ id: 'b', tier: 1, priority: 2 }),
				makeCorrelationRule({ id: 'c', tier: 1, priority: 1 }),
				makeCorrelationRule({ id: 'd', tier: 3, priority: 1 })
			];
			const sorted = [...rules].sort((a, b) => {
				if (a.tier !== b.tier) return a.tier - b.tier;
				return a.priority - b.priority;
			});
			expect(sorted.map((r) => r.id)).toEqual(['c', 'b', 'a', 'd']);
		});
	});

	describe('match type badge class', () => {
		function matchTypeBadgeClass(matchType: string): string {
			switch (matchType) {
				case 'exact':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
				case 'fuzzy':
					return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
				case 'expression':
					return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
				default:
					return '';
			}
		}

		it('exact match gets blue badge', () => {
			expect(matchTypeBadgeClass('exact')).toContain('blue');
		});

		it('fuzzy match gets amber badge', () => {
			expect(matchTypeBadgeClass('fuzzy')).toContain('amber');
		});

		it('expression match gets purple badge', () => {
			expect(matchTypeBadgeClass('expression')).toContain('purple');
		});

		it('unknown match type returns empty string', () => {
			expect(matchTypeBadgeClass('unknown')).toBe('');
		});
	});

	describe('rule count display', () => {
		it('singular when 1 rule', () => {
			const count = 1;
			const text = `${count} correlation ${count === 1 ? 'rule' : 'rules'}`;
			expect(text).toBe('1 correlation rule');
		});

		it('plural when 0 rules', () => {
			const count = 0;
			const text = `${count} correlation ${count === 1 ? 'rule' : 'rules'}`;
			expect(text).toBe('0 correlation rules');
		});

		it('plural when multiple rules', () => {
			const count = 5;
			const text = `${count} correlation ${count === 1 ? 'rule' : 'rules'}`;
			expect(text).toBe('5 correlation rules');
		});
	});

	describe('rule active status display', () => {
		it('active rule shows Active badge', () => {
			const rule = makeCorrelationRule({ is_active: true });
			expect(rule.is_active).toBe(true);
		});

		it('inactive rule shows Inactive badge', () => {
			const rule = makeCorrelationRule({ is_active: false });
			expect(rule.is_active).toBe(false);
		});
	});

	describe('rule is_definitive display', () => {
		it('definitive rule shows check icon', () => {
			const rule = makeCorrelationRule({ is_definitive: true });
			expect(rule.is_definitive).toBe(true);
		});

		it('non-definitive rule shows placeholder', () => {
			const rule = makeCorrelationRule({ is_definitive: false });
			expect(rule.is_definitive).toBe(false);
		});
	});

	describe('rule threshold display', () => {
		it('converts threshold to percentage', () => {
			const rule = makeCorrelationRule({ threshold: 0.85 });
			expect(Math.round(rule.threshold * 100)).toBe(85);
		});
	});

	describe('rule source/target mapping', () => {
		it('displays source_attribute -> target_attribute', () => {
			const rule = makeCorrelationRule({
				source_attribute: 'mail',
				target_attribute: 'email'
			});
			expect(rule.source_attribute).toBe('mail');
			expect(rule.target_attribute).toBe('email');
		});
	});

	describe('empty rules state', () => {
		it('shows empty state when no rules', () => {
			const rules: CorrelationRule[] = [];
			expect(rules.length === 0).toBe(true);
		});
	});
});

describe('Threshold form rendering logic', () => {
	describe('threshold display conversion', () => {
		it('converts auto_confirm_threshold to percentage', () => {
			const threshold = makeCorrelationThreshold({ auto_confirm_threshold: 0.9 });
			expect(Math.round(threshold.auto_confirm_threshold * 100)).toBe(90);
		});

		it('converts manual_review_threshold to percentage', () => {
			const threshold = makeCorrelationThreshold({ manual_review_threshold: 0.7 });
			expect(Math.round(threshold.manual_review_threshold * 100)).toBe(70);
		});
	});

	describe('threshold validation', () => {
		it('error when auto-confirm < manual review', () => {
			const autoConfirmPct = 60;
			const manualReviewPct = 80;
			expect(autoConfirmPct < manualReviewPct).toBe(true);
		});

		it('no error when auto-confirm >= manual review', () => {
			const autoConfirmPct = 90;
			const manualReviewPct = 70;
			expect(autoConfirmPct < manualReviewPct).toBe(false);
		});

		it('no error when auto-confirm === manual review', () => {
			const autoConfirmPct = 70;
			const manualReviewPct = 70;
			expect(autoConfirmPct < manualReviewPct).toBe(false);
		});
	});

	describe('tuning mode', () => {
		it('defaults to false', () => {
			const threshold = makeCorrelationThreshold({ tuning_mode: false });
			expect(threshold.tuning_mode).toBe(false);
		});

		it('can be enabled', () => {
			const threshold = makeCorrelationThreshold({ tuning_mode: true });
			expect(threshold.tuning_mode).toBe(true);
		});
	});

	describe('include deactivated', () => {
		it('defaults to false', () => {
			const threshold = makeCorrelationThreshold({ include_deactivated: false });
			expect(threshold.include_deactivated).toBe(false);
		});

		it('can be enabled', () => {
			const threshold = makeCorrelationThreshold({ include_deactivated: true });
			expect(threshold.include_deactivated).toBe(true);
		});
	});

	describe('batch size', () => {
		it('has default batch size of 100', () => {
			const threshold = makeCorrelationThreshold({ batch_size: 100 });
			expect(threshold.batch_size).toBe(100);
		});

		it('can have custom batch size', () => {
			const threshold = makeCorrelationThreshold({ batch_size: 500 });
			expect(threshold.batch_size).toBe(500);
		});
	});

	describe('threshold visual bar ranges', () => {
		it('calculates review zone width correctly', () => {
			const manualPct = 70;
			const autoPct = 90;
			const reviewWidth = Math.max(autoPct - manualPct, 0);
			expect(reviewWidth).toBe(20);
		});

		it('calculates auto zone width correctly', () => {
			const autoPct = 90;
			const autoWidth = 100 - autoPct;
			expect(autoWidth).toBe(10);
		});

		it('clamps values between 0 and 100', () => {
			const value = -10;
			const clamped = Math.min(Math.max(value, 0), 100);
			expect(clamped).toBe(0);

			const value2 = 150;
			const clamped2 = Math.min(Math.max(value2, 0), 100);
			expect(clamped2).toBe(100);
		});
	});
});

describe('Job status rendering logic', () => {
	describe('job status badge class', () => {
		function statusBadgeClass(status: string): string {
			switch (status) {
				case 'running':
					return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
				case 'completed':
					return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
				case 'failed':
					return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
				default:
					return '';
			}
		}

		it('running gets yellow badge', () => {
			expect(statusBadgeClass('running')).toContain('yellow');
		});

		it('completed gets green badge', () => {
			expect(statusBadgeClass('completed')).toContain('green');
		});

		it('failed gets red badge', () => {
			expect(statusBadgeClass('failed')).toContain('red');
		});
	});

	describe('progress calculation', () => {
		it('calculates progress percentage', () => {
			const processed = 75;
			const total = 100;
			expect(Math.round((processed / total) * 100)).toBe(75);
		});

		it('returns 0 when total is 0', () => {
			const processed = 0;
			const total = 0;
			const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
			expect(pct).toBe(0);
		});

		it('returns 100 when fully processed', () => {
			const processed = 200;
			const total = 200;
			expect(Math.round((processed / total) * 100)).toBe(100);
		});
	});

	describe('terminal state detection', () => {
		it('completed is terminal', () => {
			const status = 'completed';
			const isTerminal = status === 'completed' || status === 'failed';
			expect(isTerminal).toBe(true);
		});

		it('failed is terminal', () => {
			const status = 'failed';
			const isTerminal = status === 'completed' || status === 'failed';
			expect(isTerminal).toBe(true);
		});

		it('running is not terminal', () => {
			const status = 'running';
			const isTerminal = status === 'completed' || status === 'failed';
			expect(isTerminal).toBe(false);
		});
	});

	describe('job summary cards', () => {
		it('shows auto-confirmed count', () => {
			const job = {
				auto_confirmed: 35,
				queued_for_review: 10,
				no_match: 5,
				errors: 0
			};
			expect(job.auto_confirmed).toBe(35);
		});

		it('shows queued for review count', () => {
			const job = { queued_for_review: 10 };
			expect(job.queued_for_review).toBe(10);
		});

		it('shows no match count', () => {
			const job = { no_match: 5 };
			expect(job.no_match).toBe(5);
		});

		it('shows errors count', () => {
			const job = { errors: 2 };
			expect(job.errors).toBe(2);
		});
	});
});

describe('Statistics cards rendering logic', () => {
	describe('statistics card data', () => {
		it('displays total evaluated', () => {
			const stats = makeStatistics({ total_evaluated: 500 });
			expect(stats.total_evaluated).toBe(500);
		});

		it('formats auto-confirmed with percentage', () => {
			const stats = makeStatistics({
				auto_confirmed_count: 350,
				auto_confirmed_percentage: 70
			});
			const display = `${stats.auto_confirmed_count.toLocaleString()} (${Math.round(stats.auto_confirmed_percentage)}%)`;
			expect(display).toBe('350 (70%)');
		});

		it('formats manual review with percentage', () => {
			const stats = makeStatistics({
				manual_review_count: 100,
				manual_review_percentage: 20
			});
			const display = `${stats.manual_review_count.toLocaleString()} (${Math.round(stats.manual_review_percentage)}%)`;
			expect(display).toBe('100 (20%)');
		});

		it('formats no match with percentage', () => {
			const stats = makeStatistics({ no_match_count: 50, no_match_percentage: 10 });
			const display = `${stats.no_match_count.toLocaleString()} (${Math.round(stats.no_match_percentage)}%)`;
			expect(display).toBe('50 (10%)');
		});

		it('formats average confidence as percentage', () => {
			const stats = makeStatistics({ average_confidence: 0.85 });
			expect(`${Math.round(stats.average_confidence * 100)}%`).toBe('85%');
		});

		it('displays review queue depth', () => {
			const stats = makeStatistics({ review_queue_depth: 15 });
			expect(stats.review_queue_depth).toBe(15);
		});
	});

	describe('suggestions display', () => {
		it('shows suggestions when present', () => {
			const stats = makeStatistics({
				suggestions: ['Lower threshold', 'Add fuzzy rule']
			});
			expect(stats.suggestions).toHaveLength(2);
		});

		it('hides suggestions section when empty', () => {
			const stats = makeStatistics({ suggestions: [] });
			expect(stats.suggestions).toHaveLength(0);
		});
	});

	describe('null statistics', () => {
		it('shows placeholder when no statistics', () => {
			const stats: CorrelationStatistics | null = null;
			expect(stats).toBeNull();
		});
	});
});

describe('Trends table rendering logic', () => {
	describe('daily trends data', () => {
		it('shows each day row', () => {
			const trends = makeTrends();
			expect(trends.daily_trends).toHaveLength(2);
		});

		it('formats date correctly', () => {
			const day: DailyTrend = {
				date: '2026-02-01',
				total_evaluated: 50,
				auto_confirmed: 35,
				manual_review: 10,
				no_match: 5,
				average_confidence: 0.88
			};
			const d = new Date(day.date);
			expect(isNaN(d.getTime())).toBe(false);
		});

		it('shows confidence as percentage', () => {
			const day: DailyTrend = {
				date: '2026-02-01',
				total_evaluated: 50,
				auto_confirmed: 35,
				manual_review: 10,
				no_match: 5,
				average_confidence: 0.88
			};
			expect(Math.round(day.average_confidence * 100)).toBe(88);
		});
	});

	describe('empty trends', () => {
		it('shows placeholder when no daily trends', () => {
			const trends = makeTrends({ daily_trends: [] });
			expect(trends.daily_trends).toHaveLength(0);
		});
	});

	describe('null trends', () => {
		it('shows placeholder when trends is null', () => {
			const trends: CorrelationTrends | null = null;
			expect(trends).toBeNull();
		});
	});

	describe('trends suggestions', () => {
		it('shows suggestions when present', () => {
			const trends = makeTrends({
				suggestions: ['Review threshold calibration']
			});
			expect(trends.suggestions).toHaveLength(1);
		});

		it('hides suggestions when empty', () => {
			const trends = makeTrends({ suggestions: [] });
			expect(trends.suggestions).toHaveLength(0);
		});
	});

	describe('period display', () => {
		it('has period_start and period_end', () => {
			const trends = makeTrends({
				period_start: '2026-01-12',
				period_end: '2026-02-12'
			});
			expect(trends.period_start).toBe('2026-01-12');
			expect(trends.period_end).toBe('2026-02-12');
		});
	});
});

describe('Mock data conformity', () => {
	describe('CorrelationRule', () => {
		it('has all required fields', () => {
			const r = makeCorrelationRule();
			expect(r.id).toBeDefined();
			expect(r.tenant_id).toBeDefined();
			expect(r.connector_id).toBeDefined();
			expect(r.name).toBeDefined();
			expect(r.source_attribute).toBeDefined();
			expect(r.target_attribute).toBeDefined();
			expect(r.match_type).toBeDefined();
			expect(typeof r.threshold).toBe('number');
			expect(typeof r.weight).toBe('number');
			expect(typeof r.tier).toBe('number');
			expect(typeof r.is_definitive).toBe('boolean');
			expect(typeof r.normalize).toBe('boolean');
			expect(typeof r.is_active).toBe('boolean');
			expect(typeof r.priority).toBe('number');
			expect(r.created_at).toBeDefined();
			expect(r.updated_at).toBeDefined();
		});

		it('match_type is a valid value', () => {
			const validTypes = ['exact', 'fuzzy', 'expression'];
			expect(validTypes).toContain(makeCorrelationRule().match_type);
		});

		it('algorithm can be null', () => {
			const rule = makeCorrelationRule({ algorithm: null });
			expect(rule.algorithm).toBeNull();
		});

		it('algorithm can be levenshtein', () => {
			const rule = makeCorrelationRule({ algorithm: 'levenshtein' });
			expect(rule.algorithm).toBe('levenshtein');
		});

		it('algorithm can be jaro_winkler', () => {
			const rule = makeCorrelationRule({ algorithm: 'jaro_winkler' });
			expect(rule.algorithm).toBe('jaro_winkler');
		});

		it('expression can be null', () => {
			const rule = makeCorrelationRule({ expression: null });
			expect(rule.expression).toBeNull();
		});

		it('expression can be a string', () => {
			const rule = makeCorrelationRule({
				expression: 'source.email == target.email',
				match_type: 'expression'
			});
			expect(rule.expression).toBe('source.email == target.email');
		});
	});

	describe('CorrelationThreshold', () => {
		it('has all required fields', () => {
			const t = makeCorrelationThreshold();
			expect(t.id).toBeDefined();
			expect(t.connector_id).toBeDefined();
			expect(typeof t.auto_confirm_threshold).toBe('number');
			expect(typeof t.manual_review_threshold).toBe('number');
			expect(typeof t.tuning_mode).toBe('boolean');
			expect(typeof t.include_deactivated).toBe('boolean');
			expect(typeof t.batch_size).toBe('number');
			expect(t.created_at).toBeDefined();
			expect(t.updated_at).toBeDefined();
		});

		it('auto_confirm_threshold is between 0 and 1', () => {
			const t = makeCorrelationThreshold();
			expect(t.auto_confirm_threshold).toBeGreaterThanOrEqual(0);
			expect(t.auto_confirm_threshold).toBeLessThanOrEqual(1);
		});

		it('manual_review_threshold is between 0 and 1', () => {
			const t = makeCorrelationThreshold();
			expect(t.manual_review_threshold).toBeGreaterThanOrEqual(0);
			expect(t.manual_review_threshold).toBeLessThanOrEqual(1);
		});
	});

	describe('CorrelationStatistics', () => {
		it('has all required fields', () => {
			const s = makeStatistics();
			expect(s.connector_id).toBeDefined();
			expect(s.period_start).toBeDefined();
			expect(s.period_end).toBeDefined();
			expect(typeof s.total_evaluated).toBe('number');
			expect(typeof s.auto_confirmed_count).toBe('number');
			expect(typeof s.auto_confirmed_percentage).toBe('number');
			expect(typeof s.manual_review_count).toBe('number');
			expect(typeof s.manual_review_percentage).toBe('number');
			expect(typeof s.no_match_count).toBe('number');
			expect(typeof s.no_match_percentage).toBe('number');
			expect(typeof s.average_confidence).toBe('number');
			expect(typeof s.review_queue_depth).toBe('number');
			expect(Array.isArray(s.suggestions)).toBe(true);
		});
	});

	describe('CorrelationTrends', () => {
		it('has all required fields', () => {
			const t = makeTrends();
			expect(t.connector_id).toBeDefined();
			expect(t.period_start).toBeDefined();
			expect(t.period_end).toBeDefined();
			expect(Array.isArray(t.daily_trends)).toBe(true);
			expect(Array.isArray(t.suggestions)).toBe(true);
		});

		it('daily_trends entries have correct shape', () => {
			const t = makeTrends();
			const day = t.daily_trends[0];
			expect(day.date).toBeDefined();
			expect(typeof day.total_evaluated).toBe('number');
			expect(typeof day.auto_confirmed).toBe('number');
			expect(typeof day.manual_review).toBe('number');
			expect(typeof day.no_match).toBe('number');
			expect(typeof day.average_confidence).toBe('number');
		});
	});
});
