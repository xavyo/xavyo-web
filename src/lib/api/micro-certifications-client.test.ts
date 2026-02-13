import { describe, it, expect, vi } from 'vitest';
import {
	fetchMicroCertifications,
	fetchMyPendingCertifications,
	fetchMicroCertification,
	decideMicroCertificationClient,
	delegateMicroCertificationClient,
	skipMicroCertificationClient,
	bulkDecideMicroCertificationsClient,
	fetchMicroCertificationStats,
	fetchCertificationEvents,
	searchCertificationEventsClient,
	manualTriggerCertificationClient,
	fetchTriggerRules,
	fetchTriggerRule,
	createTriggerRuleClient,
	updateTriggerRuleClient,
	deleteTriggerRuleClient,
	enableTriggerRuleClient,
	disableTriggerRuleClient,
	setDefaultTriggerRuleClient
} from './micro-certifications-client';

function createMockFetch(data: unknown = {}, ok = true, status = 200) {
	return vi.fn().mockResolvedValue({
		ok,
		status,
		json: vi.fn().mockResolvedValue(data)
	});
}

// --- fetchMicroCertifications ---

describe('fetchMicroCertifications', () => {
	it('fetches from correct URL with no params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0, limit: 20, offset: 0 });
		await fetchMicroCertifications({}, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications');
	});

	it('includes query params when provided', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0, limit: 10, offset: 0 });
		await fetchMicroCertifications({ status: 'pending', limit: 10, offset: 0 }, mockFetch);
		const url = mockFetch.mock.calls[0][0] as string;
		expect(url).toContain('status=pending');
		expect(url).toContain('limit=10');
		expect(url).toContain('offset=0');
	});

	it('includes boolean and string filter params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await fetchMicroCertifications(
			{ escalated: true, past_deadline: false, user_id: 'u1', reviewer_id: 'r1', entitlement_id: 'e1' },
			mockFetch
		);
		const url = mockFetch.mock.calls[0][0] as string;
		expect(url).toContain('escalated=true');
		expect(url).toContain('past_deadline=false');
		expect(url).toContain('user_id=u1');
		expect(url).toContain('reviewer_id=r1');
		expect(url).toContain('entitlement_id=e1');
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 500);
		await expect(fetchMicroCertifications({}, mockFetch)).rejects.toThrow(
			'Failed to fetch micro certifications: 500'
		);
	});
});

// --- fetchMyPendingCertifications ---

describe('fetchMyPendingCertifications', () => {
	it('fetches from correct URL with no params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await fetchMyPendingCertifications({}, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/my-pending');
	});

	it('includes pagination params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await fetchMyPendingCertifications({ limit: 5, offset: 10 }, mockFetch);
		const url = mockFetch.mock.calls[0][0] as string;
		expect(url).toContain('limit=5');
		expect(url).toContain('offset=10');
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 403);
		await expect(fetchMyPendingCertifications({}, mockFetch)).rejects.toThrow(
			'Failed to fetch pending certifications: 403'
		);
	});
});

// --- fetchMicroCertification ---

describe('fetchMicroCertification', () => {
	it('fetches from correct URL with id', async () => {
		const mockFetch = createMockFetch({ id: 'cert-1' });
		await fetchMicroCertification('cert-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/cert-1');
	});

	it('returns the certification data', async () => {
		const certData = { id: 'cert-1', status: 'pending' };
		const mockFetch = createMockFetch(certData);
		const result = await fetchMicroCertification('cert-1', mockFetch);
		expect(result).toEqual(certData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 404);
		await expect(fetchMicroCertification('cert-1', mockFetch)).rejects.toThrow(
			'Failed to fetch micro certification: 404'
		);
	});
});

// --- decideMicroCertificationClient ---

describe('decideMicroCertificationClient', () => {
	it('posts to correct URL with body', async () => {
		const mockFetch = createMockFetch({ id: 'cert-1', status: 'approved' });
		const body = { decision: 'approve' as const, comment: 'Looks good' };
		await decideMicroCertificationClient('cert-1', body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/cert-1/decide', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	});

	it('returns the updated certification', async () => {
		const certData = { id: 'cert-1', status: 'approved' };
		const mockFetch = createMockFetch(certData);
		const result = await decideMicroCertificationClient(
			'cert-1',
			{ decision: 'approve' as const },
			mockFetch
		);
		expect(result).toEqual(certData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 400);
		await expect(
			decideMicroCertificationClient('cert-1', { decision: 'approve' as const }, mockFetch)
		).rejects.toThrow('Failed to decide on certification: 400');
	});
});

// --- delegateMicroCertificationClient ---

describe('delegateMicroCertificationClient', () => {
	it('posts to correct URL with body', async () => {
		const mockFetch = createMockFetch({ id: 'cert-1' });
		const body = { delegate_to: 'user-2', comment: 'Please review' };
		await delegateMicroCertificationClient('cert-1', body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/cert-1/delegate',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}
		);
	});

	it('returns the updated certification', async () => {
		const certData = { id: 'cert-1', reviewer_id: 'user-2' };
		const mockFetch = createMockFetch(certData);
		const result = await delegateMicroCertificationClient(
			'cert-1',
			{ delegate_to: 'user-2' },
			mockFetch
		);
		expect(result).toEqual(certData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 422);
		await expect(
			delegateMicroCertificationClient('cert-1', { delegate_to: 'user-2' }, mockFetch)
		).rejects.toThrow('Failed to delegate certification: 422');
	});
});

// --- skipMicroCertificationClient ---

describe('skipMicroCertificationClient', () => {
	it('posts to correct URL with reason', async () => {
		const mockFetch = createMockFetch({ id: 'cert-1', status: 'skipped' });
		const body = { reason: 'Not applicable to this user' };
		await skipMicroCertificationClient('cert-1', body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/cert-1/skip', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 409);
		await expect(skipMicroCertificationClient('cert-1', { reason: 'Test reason for skip' }, mockFetch)).rejects.toThrow(
			'Failed to skip certification: 409'
		);
	});
});

// --- bulkDecideMicroCertificationsClient ---

describe('bulkDecideMicroCertificationsClient', () => {
	it('posts to correct URL with body', async () => {
		const mockFetch = createMockFetch({ succeeded: 2, failed: 0, errors: [] });
		const body = {
			certification_ids: ['cert-1', 'cert-2'],
			decision: 'approve' as const,
			comment: 'Bulk approve'
		};
		await bulkDecideMicroCertificationsClient(body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/bulk-decide',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}
		);
	});

	it('returns the bulk decision response', async () => {
		const responseData = { succeeded: 3, failed: 1, errors: [{ id: 'cert-4', error: 'not found' }] };
		const mockFetch = createMockFetch(responseData);
		const result = await bulkDecideMicroCertificationsClient(
			{ certification_ids: ['cert-1'], decision: 'revoke' as const },
			mockFetch
		);
		expect(result).toEqual(responseData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 500);
		await expect(
			bulkDecideMicroCertificationsClient(
				{ certification_ids: [], decision: 'approve' as const },
				mockFetch
			)
		).rejects.toThrow('Failed to bulk decide: 500');
	});
});

// --- fetchMicroCertificationStats ---

describe('fetchMicroCertificationStats', () => {
	it('fetches from correct URL', async () => {
		const mockFetch = createMockFetch({ total: 100, pending: 20 });
		await fetchMicroCertificationStats(mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/stats');
	});

	it('returns stats data', async () => {
		const statsData = { total: 100, pending: 20, approved: 60, revoked: 20 };
		const mockFetch = createMockFetch(statsData);
		const result = await fetchMicroCertificationStats(mockFetch);
		expect(result).toEqual(statsData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 503);
		await expect(fetchMicroCertificationStats(mockFetch)).rejects.toThrow(
			'Failed to fetch stats: 503'
		);
	});
});

// --- fetchCertificationEvents ---

describe('fetchCertificationEvents', () => {
	it('fetches from correct URL with certification id', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await fetchCertificationEvents('cert-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/cert-1/events'
		);
	});

	it('returns event list response', async () => {
		const eventsData = { items: [{ id: 'ev-1', event_type: 'created' }], total: 1 };
		const mockFetch = createMockFetch(eventsData);
		const result = await fetchCertificationEvents('cert-1', mockFetch);
		expect(result).toEqual(eventsData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 404);
		await expect(fetchCertificationEvents('cert-1', mockFetch)).rejects.toThrow(
			'Failed to fetch certification events: 404'
		);
	});
});

// --- searchCertificationEventsClient ---

describe('searchCertificationEventsClient', () => {
	it('fetches from correct URL with no params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await searchCertificationEventsClient({}, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/events');
	});

	it('includes all query params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await searchCertificationEventsClient(
			{
				event_type: 'approved',
				actor_id: 'actor-1',
				certification_id: 'cert-1',
				from_date: '2026-01-01',
				to_date: '2026-02-01',
				limit: 50,
				offset: 10
			},
			mockFetch
		);
		const url = mockFetch.mock.calls[0][0] as string;
		expect(url).toContain('event_type=approved');
		expect(url).toContain('actor_id=actor-1');
		expect(url).toContain('certification_id=cert-1');
		expect(url).toContain('from_date=2026-01-01');
		expect(url).toContain('to_date=2026-02-01');
		expect(url).toContain('limit=50');
		expect(url).toContain('offset=10');
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 400);
		await expect(searchCertificationEventsClient({}, mockFetch)).rejects.toThrow(
			'Failed to search certification events: 400'
		);
	});
});

// --- manualTriggerCertificationClient ---

describe('manualTriggerCertificationClient', () => {
	it('posts to correct URL with body', async () => {
		const mockFetch = createMockFetch({ id: 'cert-new', status: 'pending' });
		const body = { user_id: 'u1', entitlement_id: 'e1', reason: 'Manual check' };
		await manualTriggerCertificationClient(body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/trigger', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	});

	it('returns the created certification', async () => {
		const certData = { id: 'cert-new', status: 'pending' };
		const mockFetch = createMockFetch(certData);
		const result = await manualTriggerCertificationClient(
			{ user_id: 'u1', entitlement_id: 'e1', reason: 'Manual check' },
			mockFetch
		);
		expect(result).toEqual(certData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 422);
		await expect(
			manualTriggerCertificationClient({ user_id: 'u1', entitlement_id: 'e1', reason: 'Test' }, mockFetch)
		).rejects.toThrow('Failed to trigger certification: 422');
	});
});

// --- fetchTriggerRules ---

describe('fetchTriggerRules', () => {
	it('fetches from correct URL with no params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await fetchTriggerRules({}, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/triggers');
	});

	it('includes filter and pagination params', async () => {
		const mockFetch = createMockFetch({ items: [], total: 0 });
		await fetchTriggerRules(
			{ trigger_type: 'event', scope_type: 'entitlement', is_active: true, limit: 25, offset: 0 },
			mockFetch
		);
		const url = mockFetch.mock.calls[0][0] as string;
		expect(url).toContain('trigger_type=event');
		expect(url).toContain('scope_type=entitlement');
		expect(url).toContain('is_active=true');
		expect(url).toContain('limit=25');
		expect(url).toContain('offset=0');
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 500);
		await expect(fetchTriggerRules({}, mockFetch)).rejects.toThrow(
			'Failed to fetch trigger rules: 500'
		);
	});
});

// --- fetchTriggerRule ---

describe('fetchTriggerRule', () => {
	it('fetches from correct URL with id', async () => {
		const mockFetch = createMockFetch({ id: 'rule-1' });
		await fetchTriggerRule('rule-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/triggers/rule-1'
		);
	});

	it('returns the trigger rule data', async () => {
		const ruleData = { id: 'rule-1', name: 'High risk rule', trigger_type: 'event' };
		const mockFetch = createMockFetch(ruleData);
		const result = await fetchTriggerRule('rule-1', mockFetch);
		expect(result).toEqual(ruleData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 404);
		await expect(fetchTriggerRule('rule-1', mockFetch)).rejects.toThrow(
			'Failed to fetch trigger rule: 404'
		);
	});
});

// --- createTriggerRuleClient ---

describe('createTriggerRuleClient', () => {
	it('posts to correct URL with body', async () => {
		const mockFetch = createMockFetch({ id: 'rule-new' });
		const body = { name: 'New rule', trigger_type: 'high_risk_assignment' as const, scope_type: 'tenant' as const, reviewer_type: 'user_manager' as const };
		await createTriggerRuleClient(body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/micro-certifications/triggers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});
	});

	it('returns the created trigger rule', async () => {
		const ruleData = { id: 'rule-new', name: 'New rule' };
		const mockFetch = createMockFetch(ruleData);
		const result = await createTriggerRuleClient({ name: 'New rule', trigger_type: 'high_risk_assignment', scope_type: 'tenant', reviewer_type: 'user_manager' }, mockFetch);
		expect(result).toEqual(ruleData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 400);
		await expect(createTriggerRuleClient({ name: 'Bad rule', trigger_type: 'manual', scope_type: 'tenant', reviewer_type: 'entitlement_owner' }, mockFetch)).rejects.toThrow(
			'Failed to create trigger rule: 400'
		);
	});
});

// --- updateTriggerRuleClient ---

describe('updateTriggerRuleClient', () => {
	it('puts to correct URL with body', async () => {
		const mockFetch = createMockFetch({ id: 'rule-1' });
		const body = { name: 'Updated rule' };
		await updateTriggerRuleClient('rule-1', body, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/triggers/rule-1',
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}
		);
	});

	it('returns the updated trigger rule', async () => {
		const ruleData = { id: 'rule-1', name: 'Updated rule' };
		const mockFetch = createMockFetch(ruleData);
		const result = await updateTriggerRuleClient('rule-1', { name: 'Updated rule' }, mockFetch);
		expect(result).toEqual(ruleData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 409);
		await expect(
			updateTriggerRuleClient('rule-1', { name: 'Conflict' }, mockFetch)
		).rejects.toThrow('Failed to update trigger rule: 409');
	});
});

// --- deleteTriggerRuleClient ---

describe('deleteTriggerRuleClient', () => {
	it('sends DELETE to correct URL', async () => {
		const mockFetch = createMockFetch(undefined, true, 204);
		await deleteTriggerRuleClient('rule-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/triggers/rule-1',
			{ method: 'DELETE' }
		);
	});

	it('returns void on success', async () => {
		const mockFetch = createMockFetch(undefined, true, 204);
		const result = await deleteTriggerRuleClient('rule-1', mockFetch);
		expect(result).toBeUndefined();
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 404);
		await expect(deleteTriggerRuleClient('rule-1', mockFetch)).rejects.toThrow(
			'Failed to delete trigger rule: 404'
		);
	});
});

// --- enableTriggerRuleClient ---

describe('enableTriggerRuleClient', () => {
	it('posts to correct URL', async () => {
		const mockFetch = createMockFetch({ id: 'rule-1', is_active: true });
		await enableTriggerRuleClient('rule-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/triggers/rule-1/enable',
			{ method: 'POST' }
		);
	});

	it('returns the updated trigger rule', async () => {
		const ruleData = { id: 'rule-1', is_active: true };
		const mockFetch = createMockFetch(ruleData);
		const result = await enableTriggerRuleClient('rule-1', mockFetch);
		expect(result).toEqual(ruleData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 409);
		await expect(enableTriggerRuleClient('rule-1', mockFetch)).rejects.toThrow(
			'Failed to enable trigger rule: 409'
		);
	});
});

// --- disableTriggerRuleClient ---

describe('disableTriggerRuleClient', () => {
	it('posts to correct URL', async () => {
		const mockFetch = createMockFetch({ id: 'rule-1', is_active: false });
		await disableTriggerRuleClient('rule-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/triggers/rule-1/disable',
			{ method: 'POST' }
		);
	});

	it('returns the updated trigger rule', async () => {
		const ruleData = { id: 'rule-1', is_active: false };
		const mockFetch = createMockFetch(ruleData);
		const result = await disableTriggerRuleClient('rule-1', mockFetch);
		expect(result).toEqual(ruleData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 500);
		await expect(disableTriggerRuleClient('rule-1', mockFetch)).rejects.toThrow(
			'Failed to disable trigger rule: 500'
		);
	});
});

// --- setDefaultTriggerRuleClient ---

describe('setDefaultTriggerRuleClient', () => {
	it('posts to correct URL', async () => {
		const mockFetch = createMockFetch({ id: 'rule-1', is_default: true });
		await setDefaultTriggerRuleClient('rule-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(
			'/api/governance/micro-certifications/triggers/rule-1/set-default',
			{ method: 'POST' }
		);
	});

	it('returns the updated trigger rule', async () => {
		const ruleData = { id: 'rule-1', is_default: true };
		const mockFetch = createMockFetch(ruleData);
		const result = await setDefaultTriggerRuleClient('rule-1', mockFetch);
		expect(result).toEqual(ruleData);
	});

	it('throws on error response', async () => {
		const mockFetch = createMockFetch(null, false, 409);
		await expect(setDefaultTriggerRuleClient('rule-1', mockFetch)).rejects.toThrow(
			'Failed to set default trigger rule: 409'
		);
	});
});
