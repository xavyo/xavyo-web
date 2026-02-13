import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import PatternCard from './pattern-card.svelte';
import type { AccessPattern } from '$lib/api/types';

function makePattern(overrides: Partial<AccessPattern> = {}): AccessPattern {
	return {
		id: 'test-id-1',
		job_id: 'job-1',
		entitlement_ids: ['ent-1', 'ent-2', 'ent-3', 'ent-4'],
		frequency: 42,
		user_count: 18,
		sample_user_ids: ['user-1', 'user-2', 'user-3'],
		created_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('PatternCard', () => {
	afterEach(cleanup);

	it('renders frequency and user count', () => {
		render(PatternCard, { props: { pattern: makePattern() } });
		expect(screen.getByText('42')).toBeTruthy();
		expect(screen.getByText('18')).toBeTruthy();
	});

	it('shows entitlement count', () => {
		render(PatternCard, { props: { pattern: makePattern() } });
		expect(screen.getByText('4')).toBeTruthy();
		expect(screen.getByText('entitlements')).toBeTruthy();
	});

	it('shows sample user count', () => {
		render(PatternCard, { props: { pattern: makePattern() } });
		expect(screen.getByText('3 sample users')).toBeTruthy();
	});
});
