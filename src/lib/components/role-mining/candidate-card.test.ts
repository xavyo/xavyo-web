import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import CandidateCard from './candidate-card.svelte';
import type { RoleCandidate } from '$lib/api/types';

function makeCandidate(overrides: Partial<RoleCandidate> = {}): RoleCandidate {
	return {
		id: 'test-id-1',
		job_id: 'job-1',
		proposed_name: 'Engineering Role',
		confidence_score: 85.5,
		member_count: 12,
		entitlement_ids: ['ent-1', 'ent-2', 'ent-3'],
		user_ids: ['user-1', 'user-2'],
		promotion_status: 'pending',
		promoted_role_id: null,
		dismissed_reason: null,
		created_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('CandidateCard', () => {
	afterEach(cleanup);

	it('renders proposed_name and confidence score', () => {
		render(CandidateCard, { props: { candidate: makeCandidate() } });
		expect(screen.getByText('Engineering Role')).toBeTruthy();
		expect(screen.getByText('85.5%')).toBeTruthy();
	});

	it('shows member count and entitlement count', () => {
		render(CandidateCard, { props: { candidate: makeCandidate() } });
		expect(screen.getByText('12 members')).toBeTruthy();
		expect(screen.getByText('3 entitlements')).toBeTruthy();
	});

	it('shows Promote and Dismiss buttons for pending candidates', () => {
		render(CandidateCard, {
			props: {
				candidate: makeCandidate({ promotion_status: 'pending' }),
				onPromote: () => {},
				onDismiss: () => {}
			}
		});
		expect(screen.getByText('Promote')).toBeTruthy();
		expect(screen.getByText('Dismiss')).toBeTruthy();
	});

	it('hides action buttons for promoted candidates', () => {
		render(CandidateCard, {
			props: {
				candidate: makeCandidate({
					promotion_status: 'promoted',
					promoted_role_id: 'role-1'
				}),
				onPromote: () => {},
				onDismiss: () => {}
			}
		});
		expect(screen.queryByText('Promote')).toBeNull();
		expect(screen.queryByText('Dismiss')).toBeNull();
	});
});
