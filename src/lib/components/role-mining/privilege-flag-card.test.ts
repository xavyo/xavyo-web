import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import PrivilegeFlagCard from './privilege-flag-card.svelte';
import type { ExcessivePrivilege } from '$lib/api/types';

function makeFlag(overrides: Partial<ExcessivePrivilege> = {}): ExcessivePrivilege {
	return {
		id: 'test-id-1',
		job_id: 'job-1',
		user_id: 'user-1',
		peer_group_id: 'pg-1',
		deviation_percent: 45.2,
		excess_entitlements: ['ent-1', 'ent-2', 'ent-3'],
		peer_average: 5.0,
		user_count: 8,
		status: 'pending',
		notes: null,
		reviewed_by: null,
		reviewed_at: null,
		created_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('PrivilegeFlagCard', () => {
	afterEach(cleanup);

	it('renders deviation percent', () => {
		render(PrivilegeFlagCard, { props: { flag: makeFlag() } });
		expect(screen.getByText('45.2%')).toBeTruthy();
	});

	it('shows excess entitlements count', () => {
		render(PrivilegeFlagCard, { props: { flag: makeFlag() } });
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('shows Accept and Remediate buttons for pending flags', () => {
		render(PrivilegeFlagCard, {
			props: {
				flag: makeFlag({ status: 'pending' }),
				onReview: () => {}
			}
		});
		expect(screen.getByText('Accept')).toBeTruthy();
		expect(screen.getByText('Remediate')).toBeTruthy();
	});

	it('hides action buttons for accepted flags', () => {
		render(PrivilegeFlagCard, {
			props: {
				flag: makeFlag({ status: 'accepted' }),
				onReview: () => {}
			}
		});
		expect(screen.queryByText('Accept')).toBeNull();
		expect(screen.queryByText('Remediate')).toBeNull();
	});
});
