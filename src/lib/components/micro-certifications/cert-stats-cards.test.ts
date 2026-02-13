import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CertStatsCards from './cert-stats-cards.svelte';
import type { MicroCertificationStats } from '$lib/api/types';

const mockStats: MicroCertificationStats = {
	total: 100,
	pending: 15,
	approved: 60,
	revoked: 10,
	auto_revoked: 2,
	flagged_for_review: 3,
	expired: 7,
	skipped: 3,
	escalated: 4,
	past_deadline: 2,
	by_trigger_type: undefined
};

describe('CertStatsCards', () => {
	it('renders all stat cards', () => {
		render(CertStatsCards, { props: { stats: mockStats } });
		expect(screen.getAllByTestId('stat-card').length).toBeGreaterThanOrEqual(8);
	});

	it('displays total count', () => {
		render(CertStatsCards, { props: { stats: mockStats } });
		expect(screen.getByText('100')).toBeTruthy();
	});

	it('displays pending count', () => {
		render(CertStatsCards, { props: { stats: mockStats } });
		expect(screen.getByText('15')).toBeTruthy();
	});

	it('displays approved count', () => {
		render(CertStatsCards, { props: { stats: mockStats } });
		expect(screen.getByText('60')).toBeTruthy();
	});

	it('displays label text for each card', () => {
		render(CertStatsCards, { props: { stats: mockStats } });
		expect(screen.getByText('Total')).toBeTruthy();
		expect(screen.getByText('Pending')).toBeTruthy();
		expect(screen.getByText('Approved')).toBeTruthy();
		expect(screen.getByText('Revoked')).toBeTruthy();
		expect(screen.getByText('Past Deadline')).toBeTruthy();
	});
});
