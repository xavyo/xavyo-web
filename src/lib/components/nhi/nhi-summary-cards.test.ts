import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import NhiSummaryCards from './nhi-summary-cards.svelte';
import type { NhiOverallSummary } from '$lib/api/types';

function makeSummary(overrides: Partial<NhiOverallSummary> = {}): NhiOverallSummary {
	return {
		total: 42,
		active: 30,
		expired: 3,
		suspended: 2,
		needs_certification: 4,
		needs_rotation: 1,
		inactive: 2,
		...overrides
	};
}

describe('NhiSummaryCards', () => {
	afterEach(cleanup);

	it('renders all summary cards with correct labels', () => {
		render(NhiSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('Total')).toBeTruthy();
		expect(screen.getByText('Active')).toBeTruthy();
		expect(screen.getByText('Expired')).toBeTruthy();
		expect(screen.getByText('Suspended')).toBeTruthy();
		expect(screen.getByText('Needs Cert')).toBeTruthy();
		expect(screen.getByText('Needs Rotation')).toBeTruthy();
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('renders correct count values', () => {
		render(NhiSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('42')).toBeTruthy();
		expect(screen.getByText('30')).toBeTruthy();
		expect(screen.getByText('3')).toBeTruthy();
		// "2" appears in both Suspended and Inactive cards
		expect(screen.getAllByText('2')).toHaveLength(2);
		expect(screen.getByText('4')).toBeTruthy();
		expect(screen.getByText('1')).toBeTruthy();
	});

	it('renders nothing when summary is null', () => {
		const { container } = render(NhiSummaryCards, { props: { summary: null } });
		expect(container.querySelector('.grid')).toBeNull();
	});

	it('renders zero values correctly', () => {
		render(NhiSummaryCards, {
			props: {
				summary: makeSummary({
					total: 0,
					active: 0,
					expired: 0,
					suspended: 0,
					needs_certification: 0,
					needs_rotation: 0,
					inactive: 0
				})
			}
		});
		const zeros = screen.getAllByText('0');
		expect(zeros.length).toBe(7);
	});

	it('renders large numbers correctly', () => {
		render(NhiSummaryCards, {
			props: { summary: makeSummary({ total: 99999 }) }
		});
		expect(screen.getByText('99999')).toBeTruthy();
	});
});
