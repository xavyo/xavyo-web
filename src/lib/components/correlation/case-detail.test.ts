import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import CaseDetail from './case-detail.svelte';
import type { CorrelationCaseDetail } from '$lib/api/types';

vi.mock('$lib/api/correlation-client', () => ({
	confirmCaseClient: vi.fn(),
	rejectCaseClient: vi.fn(),
	createIdentityFromCaseClient: vi.fn(),
	reassignCaseClient: vi.fn()
}));

function makeCaseDetail(overrides: Partial<CorrelationCaseDetail> = {}): CorrelationCaseDetail {
	return {
		id: 'case-1',
		connector_id: 'conn-1',
		connector_name: 'LDAP Connector',
		account_identifier: 'jdoe@example.com',
		account_id: 'acc-1',
		status: 'pending',
		trigger_type: 'import',
		highest_confidence: 0.92,
		candidate_count: 2,
		assigned_to: null,
		created_at: '2025-06-01T10:00:00Z',
		account_attributes: {
			email: 'jdoe@example.com',
			department: 'Engineering'
		},
		candidates: [
			{
				id: 'cand-1',
				identity_id: 'id-1',
				identity_display_name: 'John Doe',
				identity_attributes: { email: 'john.doe@example.com' },
				aggregate_confidence: 0.92,
				per_attribute_scores: { email: 0.95 },
				is_deactivated: false,
				is_definitive_match: false
			},
			{
				id: 'cand-2',
				identity_id: 'id-2',
				identity_display_name: 'Jane Doe',
				identity_attributes: { email: 'jane.doe@example.com' },
				aggregate_confidence: 0.75,
				per_attribute_scores: { email: 0.7 },
				is_deactivated: false,
				is_definitive_match: false
			}
		],
		resolved_by: null,
		resolved_at: null,
		resolution_reason: null,
		rules_snapshot: {},
		updated_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('CaseDetail', () => {
	afterEach(cleanup);

	it('renders the account identifier as heading', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Case: jdoe@example.com')).toBeTruthy();
	});

	it('renders the connector name', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Connector: LDAP Connector')).toBeTruthy();
	});

	it('renders status badge', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('pending')).toBeTruthy();
	});

	it('renders trigger type badge', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		// 'import' appears in both badge and account info section
		expect(screen.getAllByText('import').length).toBeGreaterThanOrEqual(1);
	});

	it('renders account attributes', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Account Attributes')).toBeTruthy();
		expect(screen.getByText('department')).toBeTruthy();
		expect(screen.getByText('Engineering')).toBeTruthy();
	});

	it('renders candidates count heading', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Candidates (2)')).toBeTruthy();
	});

	it('renders empty candidates message when no candidates', () => {
		render(CaseDetail, {
			props: { caseDetail: makeCaseDetail({ candidates: [] }) }
		});
		expect(screen.getByText('No candidate identities found.')).toBeTruthy();
	});

	it('renders action buttons when status is pending', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Confirm Match')).toBeTruthy();
		expect(screen.getByText('Reject All')).toBeTruthy();
		expect(screen.getByText('Create New Identity')).toBeTruthy();
		expect(screen.getByText('Reassign')).toBeTruthy();
	});

	it('does not render action buttons when status is confirmed', () => {
		render(CaseDetail, {
			props: {
				caseDetail: makeCaseDetail({
					status: 'confirmed',
					resolved_by: 'admin',
					resolved_at: '2025-06-02T12:00:00Z',
					resolution_reason: 'Verified match'
				})
			}
		});
		expect(screen.queryByText('Confirm Match')).toBeNull();
		expect(screen.queryByText('Reject All')).toBeNull();
		expect(screen.queryByText('Create New Identity')).toBeNull();
		expect(screen.queryByText('Reassign')).toBeNull();
	});

	it('does not render action buttons when status is rejected', () => {
		render(CaseDetail, {
			props: {
				caseDetail: makeCaseDetail({
					status: 'rejected',
					resolved_by: 'admin',
					resolved_at: '2025-06-02T12:00:00Z',
					resolution_reason: 'No match found'
				})
			}
		});
		expect(screen.queryByText('Confirm Match')).toBeNull();
	});

	it('renders resolution info when case is resolved', () => {
		render(CaseDetail, {
			props: {
				caseDetail: makeCaseDetail({
					status: 'confirmed',
					resolved_by: 'admin-user',
					resolved_at: '2025-06-02T12:00:00Z',
					resolution_reason: 'Verified match'
				})
			}
		});
		expect(screen.getByText('Resolution')).toBeTruthy();
		expect(screen.getByText('Resolved by: admin-user')).toBeTruthy();
		expect(screen.getByText('Reason: Verified match')).toBeTruthy();
	});

	it('does not render resolution info when case is pending', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.queryByText('Resolution')).toBeNull();
	});

	it('renders identity_created status with space-replaced label', () => {
		render(CaseDetail, {
			props: {
				caseDetail: makeCaseDetail({
					status: 'identity_created',
					resolved_by: 'admin',
					resolved_at: '2025-06-02T12:00:00Z'
				})
			}
		});
		expect(screen.getByText('identity created')).toBeTruthy();
	});

	it('renders account information section heading', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Account Information')).toBeTruthy();
	});

	it('renders account identifier in detail section', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Account Identifier')).toBeTruthy();
	});

	it('renders trigger type in detail section', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		expect(screen.getByText('Trigger Type')).toBeTruthy();
	});

	it('handles null account_attributes gracefully', () => {
		render(CaseDetail, {
			props: {
				caseDetail: makeCaseDetail({ account_attributes: {} })
			}
		});
		expect(screen.queryByText('Account Attributes')).toBeNull();
	});

	it('renders Confirm Match button as disabled when no candidate selected', () => {
		render(CaseDetail, { props: { caseDetail: makeCaseDetail() } });
		const confirmButton = screen.getByText('Confirm Match').closest('button');
		expect(confirmButton?.disabled).toBe(true);
	});
});
