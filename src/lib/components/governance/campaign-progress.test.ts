import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CampaignProgress from './campaign-progress.svelte';
import type { CampaignProgressResponse } from '$lib/api/types';

describe('CampaignProgress', () => {
	const progress: CampaignProgressResponse = {
		total_items: 100,
		pending_items: 40,
		approved_items: 45,
		revoked_items: 15,
		completion_percentage: 60
	};

	it('renders completion percentage', () => {
		render(CampaignProgress, { props: { progress } });
		expect(screen.getByText('60%')).toBeTruthy();
	});

	it('renders item counts', () => {
		render(CampaignProgress, { props: { progress } });
		expect(screen.getByText(/Pending: 40/)).toBeTruthy();
		expect(screen.getByText(/Approved: 45/)).toBeTruthy();
		expect(screen.getByText(/Revoked: 15/)).toBeTruthy();
		expect(screen.getByText(/Total: 100/)).toBeTruthy();
	});

	it('renders progress bar', () => {
		const { container } = render(CampaignProgress, { props: { progress } });
		const progressBar = container.querySelector('[style*="width: 60%"]');
		expect(progressBar).toBeTruthy();
	});

	it('handles 0% completion', () => {
		const empty: CampaignProgressResponse = {
			total_items: 50,
			pending_items: 50,
			approved_items: 0,
			revoked_items: 0,
			completion_percentage: 0
		};
		render(CampaignProgress, { props: { progress: empty } });
		expect(screen.getByText('0%')).toBeTruthy();
	});

	it('handles 100% completion', () => {
		const full: CampaignProgressResponse = {
			total_items: 50,
			pending_items: 0,
			approved_items: 40,
			revoked_items: 10,
			completion_percentage: 100
		};
		render(CampaignProgress, { props: { progress: full } });
		expect(screen.getByText('100%')).toBeTruthy();
	});
});
