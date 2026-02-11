import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import NhiCertCampaignTable from './nhi-cert-campaign-table.svelte';
import type { NhiCertificationCampaign } from '$lib/api/types';

function makeCampaigns(): NhiCertificationCampaign[] {
	return [
		{
			id: 'camp-1',
			tenant_id: 't-1',
			name: 'Q1 2026 Cert',
			description: 'Quarterly review',
			scope: 'all',
			nhi_type_filter: null,
			specific_nhi_ids: null,
			status: 'active',
			due_date: '2026-03-31T00:00:00Z',
			created_by: 'admin',
			created_at: '2026-01-01T00:00:00Z',
			updated_at: '2026-01-01T00:00:00Z'
		},
		{
			id: 'camp-2',
			tenant_id: 't-1',
			name: 'Agent Audit',
			description: null,
			scope: 'by_type',
			nhi_type_filter: 'agent',
			specific_nhi_ids: null,
			status: 'completed',
			due_date: null,
			created_by: null,
			created_at: '2025-12-01T00:00:00Z',
			updated_at: '2025-12-01T00:00:00Z'
		}
	];
}

describe('NhiCertCampaignTable', () => {
	afterEach(cleanup);

	it('renders campaign count', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		expect(screen.getByText('2 certification campaigns')).toBeTruthy();
	});

	it('renders campaign names as links', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		expect(screen.getByText('Q1 2026 Cert')).toBeTruthy();
		expect(screen.getByText('Agent Audit')).toBeTruthy();
	});

	it('renders campaign links to detail pages', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		const links = document.querySelectorAll('a[href]');
		const hrefs = Array.from(links).map(l => l.getAttribute('href'));
		expect(hrefs).toContain('/nhi/governance/certifications/camp-1');
		expect(hrefs).toContain('/nhi/governance/certifications/camp-2');
	});

	it('renders status badges', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		expect(screen.getByText('active')).toBeTruthy();
		expect(screen.getByText('completed')).toBeTruthy();
	});

	it('renders scope', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		expect(screen.getByText('all')).toBeTruthy();
		expect(screen.getByText('by_type')).toBeTruthy();
	});

	it('renders type filter or All', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		expect(screen.getByText('agent')).toBeTruthy();
		expect(screen.getByText('All')).toBeTruthy();
	});

	it('renders create campaign link', () => {
		render(NhiCertCampaignTable, { props: { campaigns: makeCampaigns() } });
		expect(screen.getByText('Create Campaign')).toBeTruthy();
	});

	it('shows empty state when no campaigns', () => {
		render(NhiCertCampaignTable, { props: { campaigns: [] } });
		expect(screen.getByText('No certification campaigns created.')).toBeTruthy();
		expect(screen.getByText('0 certification campaigns')).toBeTruthy();
	});
});
