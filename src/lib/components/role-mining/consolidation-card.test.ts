import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ConsolidationCard from './consolidation-card.svelte';
import type { ConsolidationSuggestion } from '$lib/api/types';

function makeSuggestion(overrides: Partial<ConsolidationSuggestion> = {}): ConsolidationSuggestion {
	return {
		id: 'test-id-1',
		job_id: 'job-1',
		role_a_id: 'role-a',
		role_b_id: 'role-b',
		overlap_percent: 72.5,
		shared_entitlements: ['ent-1', 'ent-2', 'ent-3'],
		unique_to_a: ['ent-4'],
		unique_to_b: ['ent-5', 'ent-6'],
		status: 'pending',
		dismissed_reason: null,
		created_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('ConsolidationCard', () => {
	afterEach(cleanup);

	it('renders overlap percent', () => {
		render(ConsolidationCard, { props: { suggestion: makeSuggestion() } });
		expect(screen.getByText('72.5%')).toBeTruthy();
	});

	it('shows shared and unique entitlement counts', () => {
		render(ConsolidationCard, { props: { suggestion: makeSuggestion() } });
		expect(screen.getByText('3')).toBeTruthy();
		expect(screen.getByText('1')).toBeTruthy();
		expect(screen.getByText('2')).toBeTruthy();
	});

	it('shows Dismiss button for pending suggestions', () => {
		render(ConsolidationCard, {
			props: {
				suggestion: makeSuggestion({ status: 'pending' }),
				onDismiss: () => {}
			}
		});
		expect(screen.getByText('Dismiss')).toBeTruthy();
	});
});
